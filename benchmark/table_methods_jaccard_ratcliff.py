import json
import re
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd


METHOD_TO_FILE: Dict[str, str] = {
    "DWT-DCT": "results/DWT-DCT_benchmark_results.json",
    "LBS": "results/LBS_benchmark_results.json",
    "MBRS": "results/MBRS_benchmark_results.json",
    "RAW": "results/RAW_benchmark_results.json",
    "VINE": "results/LBS_benchmark_results.json",  # placeholder
}

# ---- Merge lengths here ----
# This makes length 31 get treated as 32 (so both appear as one column group "31")
LENGTH_ALIAS: Dict[int, int] = {
    31: 32,
}

SAMPLE_SIZE = 100  # Sample size per message length


def clean_message(msg: str) -> str:
    if msg is None:
        return ""
    msg = str(msg)
    msg = re.sub(r"\s+", " ", msg).strip()
    msg = re.sub(r"(?:\s+00)+$", "", msg).strip()
    return msg


def mean_pm_std(mean, std) -> str:
    if mean is None or std is None or pd.isna(mean) or pd.isna(std):
        return "-"
    return f"{mean:.2f} $\\pm$ {std:.2f}"


def pooled_std(means: List[float], stds: List[float], n: int) -> float:
    """
    Calculate pooled standard deviation across groups.

    Formula: sqrt(sum((n-1)*s_i^2 + n*(x_i - x_pooled)^2) / (k*n - 1))
    where k is number of groups, n is sample size per group
    """
    means = np.array(means)
    stds = np.array(stds)

    # Remove NaN values
    mask = ~(np.isnan(means) | np.isnan(stds))
    means = means[mask]
    stds = stds[mask]

    if len(means) == 0:
        return np.nan

    k = len(means)
    x_pooled = np.mean(means)

    variance_within = np.sum((n - 1) * stds**2)
    variance_between = np.sum(n * (means - x_pooled) ** 2)
    pooled_variance = (variance_within + variance_between) / (k * n - 1)

    return np.sqrt(pooled_variance)


def load_rows_for_method(method: str, filepath: str) -> pd.DataFrame:
    data = json.loads(Path(filepath).read_text(encoding="utf-8"))
    rows = []

    for item in data:
        if item.get("attacks") is not None:
            continue

        r = item.get("results", {}) or {}
        msg = clean_message(item.get("message", ""))
        msg_len = len(msg)
        msg_len_group = LENGTH_ALIAS.get(msg_len, msg_len)

        rows.append(
            {
                "method": method,
                "length": msg_len_group,
                "ratcliff_mean": r.get("avg_ratcliff_obershelp_scores"),
                "ratcliff_std": r.get("std_ratcliff_obershelp_scores"),
                "jaccard_mean": r.get("avg_jaccard_scores"),
                "jaccard_std": r.get("std_jaccard_scores"),
            }
        )

    return pd.DataFrame(rows)


def build_table_methods_rows_lengths_cols(method_to_file: Dict[str, str]) -> pd.DataFrame:
    all_rows = []

    for method, fp in method_to_file.items():
        if not Path(fp).exists():
            print(f"⚠️ Skipping {method}: file not found ({fp})")
            continue
        df = load_rows_for_method(method, fp)
        if not df.empty:
            all_rows.append(df)

    if not all_rows:
        return pd.DataFrame()

    df = pd.concat(all_rows, ignore_index=True)

    # Aggregate if multiple messages map to the same length (e.g. 31 and 32 -> 31)
    agg = (
        df.groupby(["method", "length"], as_index=False)
        .agg(
            ratcliff_mean=("ratcliff_mean", "mean"),
            ratcliff_std=("ratcliff_std", "mean"),
            jaccard_mean=("jaccard_mean", "mean"),
            jaccard_std=("jaccard_std", "mean"),
        )
    )

    # Format
    agg["Ratcliff"] = agg.apply(
        lambda r: mean_pm_std(r["ratcliff_mean"], r["ratcliff_std"]), axis=1
    )
    agg["Jaccard"] = agg.apply(
        lambda r: mean_pm_std(r["jaccard_mean"], r["jaccard_std"]), axis=1
    )

    # Wide format: rows=method, columns=(length, metric)
    wide = agg.pivot(index="method", columns="length", values=["Ratcliff", "Jaccard"])

    # pivot gives columns (metric, length) -> swap to (length, metric)
    wide = wide.swaplevel(0, 1, axis=1)
    wide.columns.names = ["length", "metric"]

    wide = wide.sort_index(axis=1, level=0)  # sort by length
    wide = wide.sort_index(axis=0)           # sort methods
    wide = wide.fillna("-")
    wide.index.name = "method"

    return wide


def build_averaged_table(method_to_file: Dict[str, str]) -> pd.DataFrame:
    """Build table with methods as rows, averaged across all message lengths."""
    all_rows = []

    for method, fp in method_to_file.items():
        if not Path(fp).exists():
            print(f"⚠️ Skipping {method}: file not found ({fp})")
            continue
        df = load_rows_for_method(method, fp)
        if not df.empty:
            all_rows.append(df)

    if not all_rows:
        return pd.DataFrame()

    df = pd.concat(all_rows, ignore_index=True)

    results = []
    for method in df["method"].unique():
        method_df = df[df["method"] == method]

        rat_means = method_df["ratcliff_mean"].dropna().tolist()
        rat_stds = method_df["ratcliff_std"].dropna().tolist()
        jac_means = method_df["jaccard_mean"].dropna().tolist()
        jac_stds = method_df["jaccard_std"].dropna().tolist()

        results.append(
            {
                "method": method,
                "Ratcliff": mean_pm_std(
                    np.mean(rat_means) if rat_means else None,
                    pooled_std(rat_means, rat_stds, SAMPLE_SIZE) if rat_means else None,
                ),
                "Jaccard": mean_pm_std(
                    np.mean(jac_means) if jac_means else None,
                    pooled_std(jac_means, jac_stds, SAMPLE_SIZE) if jac_means else None,
                ),
            }
        )

    result_df = pd.DataFrame(results).set_index("method").sort_index()
    return result_df


def latex_escape(s: str) -> str:
    return (
        str(s)
        .replace("\\", "\\textbackslash{}")
        .replace("&", "\\&")
        .replace("%", "\\%")
        .replace("$", "\\$")
        .replace("#", "\\#")
        .replace("_", "\\_")
        .replace("{", "\\{")
        .replace("}", "\\}")
        .replace("~", "\\textasciitilde{}")
        .replace("^", "\\textasciicircum{}")
    )


def make_simple_latex_table(table: pd.DataFrame, caption: str, label: str) -> str:
    """Generate LaTeX table for averaged results."""
    header = "\\textbf{Method} & \\textbf{Ratcliff} & \\textbf{Jaccard} \\\\"

    body_lines = []
    for method, row in table.iterrows():
        body_lines.append(
            f"{latex_escape(method)} & {row['Ratcliff']} & {row['Jaccard']} \\\\"
        )
    body = "\n".join(body_lines)

    latex = f"""% Auto-generated table (averaged across message lengths)
% Required in preamble:
% \\usepackage{{booktabs}}
% \\usepackage{{array}}

\\begin{{table}}[t]
\\centering
\\footnotesize
\\setlength{{\\tabcolsep}}{{8pt}}
\\renewcommand{{\\arraystretch}}{{1.15}}

\\begin{{tabular}}{{l c c}}
\\toprule
{header}
\\midrule
{body}
\\bottomrule
\\end{{tabular}}

\\caption{{{caption}}}
\\label{{{label}}}

\\vspace{{6pt}}
\\end{{table}}
"""
    return latex


def make_latex_table(table: pd.DataFrame, caption: str, label: str) -> str:
    lengths: List[int] = list(dict.fromkeys([int(L) for (L, metric) in table.columns]))

    n_groups = len(lengths)
    n_metric_cols = 2 * n_groups

    super_header = (
        "\\multicolumn{1}{l}{} & "
        f"\\multicolumn{{{n_metric_cols}}}{{c}}{{\\textbf{{Message length}}}} \\\\"
    )

    header1_cells = ["\\textbf{method}"]
    for L in lengths:
        header1_cells.append(f"\\multicolumn{{2}}{{c}}{{{L}}}")
    header1 = " & ".join(header1_cells) + " \\\\"

    cmid = []
    col_start = 2
    for _ in lengths:
        cmid.append(f"\\cmidrule(lr){{{col_start}-{col_start+1}}}")
        col_start += 2
    cmidrules = "".join(cmid)

    header2_cells = [""]
    for _ in lengths:
        header2_cells += ["Ratcliff", "Jaccard"]
    header2 = " & ".join(header2_cells) + " \\\\"

    metric_label_row = (
        "\\multicolumn{1}{l}{} & "
        f"\\multicolumn{{{n_metric_cols}}}{{c}}{{\\textbf{{Similarity score}}}} \\\\"
    )

    body_lines = []
    for method, row in table.iterrows():
        vals = []
        for L in lengths:
            vals.append(str(row[(L, "Ratcliff")]))
            vals.append(str(row[(L, "Jaccard")]))
        body_lines.append(" & ".join([latex_escape(method)] + vals) + " \\\\")
    body = "\n".join(body_lines)

    first_col = r">{\raggedright\arraybackslash}p{2.2cm}"
    metric_cols = " ".join([r">{\centering\arraybackslash}p{1.25cm}"] * n_metric_cols)
    colspec = first_col + " " + metric_cols

    latex = f"""% Auto-generated table (methods as rows, message LENGTH as columns)
% Required in preamble:
% \\usepackage{{booktabs}}
% \\usepackage{{array}}
% (optional spacing): \\usepackage{{caption}}

\\begin{{table*}}[t]
\\centering
\\footnotesize
\\setlength{{\\tabcolsep}}{{3pt}}
\\renewcommand{{\\arraystretch}}{{1.15}}

\\begin{{tabular}}{{{colspec}}}
\\toprule
{super_header}
{header1}
{cmidrules}
{metric_label_row}
{header2}
\\midrule
{body}
\\bottomrule
\\end{{tabular}}

\\caption{{{caption}}}
\\label{{{label}}}

\\vspace{{6pt}} % <-- adds space below the table before text
\\end{{table*}}
"""
    return latex


if __name__ == "__main__":
    # Generate original table (by message length)
    table_by_length = build_table_methods_rows_lengths_cols(METHOD_TO_FILE)
    table_by_length.to_csv("ratcliff_jaccard_methods_rows_lengths_cols.csv")

    tex_by_length = make_latex_table(
        table_by_length,
        caption="Ratcliff/Obershelp and Jaccard (mean $\\pm$ std) across methods and message lengths.",
        label="tab:ratcliff-jaccard-methods-lengths",
    )
    out_by_length = Path("table_methods_rows_lengths_cols.tex")
    out_by_length.write_text(tex_by_length, encoding="utf-8")
    print(f"Wrote: {out_by_length.resolve()}")

    # Generate averaged table
    table = build_averaged_table(METHOD_TO_FILE)

    # Save to CSV
    table.to_csv("ratcliff_jaccard_averaged.csv")
    print("Saved: ratcliff_jaccard_averaged.csv")

    # Generate LaTeX
    tex = make_simple_latex_table(
        table,
        caption="Ratcliff/Obershelp and Jaccard (mean $\\pm$ pooled std) averaged across all message lengths.",
        label="tab:ratcliff-jaccard-averaged",
    )

    out = Path("table_averaged.tex")
    out.write_text(tex, encoding="utf-8")
    print(f"Wrote: {out.resolve()}")

    # Display the table
    print("\nGenerated table:")
    print(table)
