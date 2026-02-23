import json
import re
from pathlib import Path
from typing import Dict, List

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
                "lpips_mean": r.get("avg_lpips_val_scores"),
                "lpips_std": r.get("std_lpips_val_scores"),
                "ssim_mean": r.get("avg_ssim_val_scores"),
                "ssim_std": r.get("std_ssim_val_scores"),
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
            lpips_mean=("lpips_mean", "mean"),
            lpips_std=("lpips_std", "mean"),
            ssim_mean=("ssim_mean", "mean"),
            ssim_std=("ssim_std", "mean"),
        )
    )

    # Format
    agg["LPIPS"] = agg.apply(lambda r: mean_pm_std(r["lpips_mean"], r["lpips_std"]), axis=1)
    agg["SSIM"] = agg.apply(lambda r: mean_pm_std(r["ssim_mean"], r["ssim_std"]), axis=1)

    # Wide format: rows=method, columns=(length, metric)
    wide = agg.pivot(index="method", columns="length", values=["LPIPS", "SSIM"])

    # pivot gives columns (metric, length) -> swap to (length, metric)
    wide = wide.swaplevel(0, 1, axis=1)
    wide.columns.names = ["length", "metric"]

    wide = wide.sort_index(axis=1, level=0)   # sort by length
    wide = wide.sort_index(axis=0)            # sort methods
    wide = wide.fillna("-")
    wide.index.name = "method"

    return wide


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


def make_latex_table(table: pd.DataFrame, caption: str, label: str) -> str:
    lengths: List[int] = list(dict.fromkeys([int(L) for (L, metric) in table.columns]))

    n_groups = len(lengths)
    n_metric_cols = 2 * n_groups

    # ---- Super header: Message length over all metric columns ----
    super_header = (
        "\\multicolumn{1}{l}{} & "
        f"\\multicolumn{{{n_metric_cols}}}{{c}}{{\\textbf{{Message length}}}} \\\\"
    )

    # Header 1: multicolumn per length
    header1_cells = ["\\textbf{method}"]
    for L in lengths:
        header1_cells.append(f"\\multicolumn{{2}}{{c}}{{{L}}}")
    header1 = " & ".join(header1_cells) + " \\\\"

    # cmidrules for length blocks
    cmid = []
    col_start = 2
    for _ in lengths:
        cmid.append(f"\\cmidrule(lr){{{col_start}-{col_start+1}}}")
        col_start += 2
    cmidrules = "".join(cmid)

    # Header 2: LPIPS / SSIM
    header2_cells = [""]
    for _ in lengths:
        header2_cells += ["LPIPS", "SSIM"]
    header2 = " & ".join(header2_cells) + " \\\\"

    # Optional: label the metrics row as "Image quality score"
    metric_label_row = (
        "\\multicolumn{1}{l}{} & "
        f"\\multicolumn{{{n_metric_cols}}}{{c}}{{\\textbf{{Image quality score}}}} \\\\"
    )

    # Body
    body_lines = []
    for method, row in table.iterrows():
        vals = []
        for L in lengths:
            vals.append(str(row[(L, "LPIPS")]))
            vals.append(str(row[(L, "SSIM")]))
        body_lines.append(" & ".join([latex_escape(method)] + vals) + " \\\\")
    body = "\n".join(body_lines)

    # Column spec (same as before)
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
    table = build_table_methods_rows_lengths_cols(METHOD_TO_FILE)

    table.to_csv("lpips_ssim_methods_rows_lengths_cols.csv")

    tex = make_latex_table(
        table,
        caption="LPIPS and SSIM (mean $\\pm$ std) across methods and message lengths.",
        label="tab:lpips-ssim-methods-lengths",
    )

    out = Path("table_methods_rows_lengths_cols.tex")
    out.write_text(tex, encoding="utf-8")
    print(f"Wrote: {out.resolve()}")
