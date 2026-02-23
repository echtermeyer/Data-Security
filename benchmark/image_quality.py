import json
import re
from pathlib import Path
from typing import Dict

import pandas as pd


METHOD_TO_FILE: Dict[str, str] = {
    "DWT-DCT": "results/DWT-DCT_benchmark_results.json",
    "LBS": "results/LBS_benchmark_results.json",
    "RAW": "results/RAW_benchmark_results.json",
    "MBRS": "results/MBRS_benchmark_results.json",
    "VINE": "results/LBS_benchmark_results.json",  # TEMP: same as LBS
}


def clean_message(msg: str) -> str:
    if msg is None:
        return ""
    msg = str(msg)
    msg = re.sub(r"\s+", " ", msg).strip()
    msg = re.sub(r"(?:\s+00)+$", "", msg).strip()
    return msg


def mean_pm_std(mean, std, precision=2) -> str:
    if pd.isna(mean) or pd.isna(std):
        return "-"
    return f"{mean:.{precision}f} $\\pm$ {std:.{precision}f}"




def summarize_one_file(filepath: str) -> pd.DataFrame:
    data = json.loads(Path(filepath).read_text(encoding="utf-8"))

    rows = []
    for item in data:
        if item.get("attacks") is not None:
            continue

        results = item.get("results", {}) or {}
        msg = clean_message(item.get("message", ""))

        rows.append(
            {
                "message": msg,
                "lpips_mean": results.get("avg_lpips_val_scores"),
                "lpips_std": results.get("std_lpips_val_scores"),
                "ssim_mean": results.get("avg_ssim_val_scores"),
                "ssim_std": results.get("std_ssim_val_scores"),
            }
        )

    return pd.DataFrame(rows)



def build_methods_table_pmstd(method_to_file: Dict[str, str], precision: int = 2) -> pd.DataFrame:
    tables = []

    for method, filepath in method_to_file.items():
        if not Path(filepath).exists():
            print(f"⚠️  Skipping {method}: file not found ({filepath})")
            continue

        agg = summarize_one_file(filepath)

        agg[(method, "LPIPS")] = agg.apply(
            lambda r: mean_pm_std(r["lpips_mean"], r["lpips_std"], precision), axis=1
        )
        agg[(method, "SSIM")] = agg.apply(
            lambda r: mean_pm_std(r["ssim_mean"], r["ssim_std"], precision), axis=1
        )

        t = agg[["message", (method, "LPIPS"), (method, "SSIM")]].set_index("message")
        t.columns = pd.MultiIndex.from_tuples(t.columns)
        tables.append(t)

    out = pd.concat(tables, axis=1)
    out = out.sort_index(axis=1, level=0)  # method order
    out = out.sort_index(axis=0)           # message order
    out = out.fillna("-")

    return out


def dataframe_rows_to_latex(table: pd.DataFrame) -> str:
    """Return ONLY the body rows (no header/tabular environment) to paste into LaTeX template."""
    df = table.copy()

    # Flatten MultiIndex columns into a single level (method_metric) for easier row export
    df.columns = [f"{m}_{k}" for (m, k) in df.columns]

    # Keep a stable method order (optional)
    # df = df[[...]]  # if you want manual ordering

    lines = []
    for msg, row in df.iterrows():
        # escape LaTeX special chars in message (very important!)
        safe_msg = (
            str(msg)
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

        cells = [safe_msg] + [str(v) for v in row.values]
        lines.append(" & ".join(cells) + " \\\\")
    return "\n".join(lines)


if __name__ == "__main__":
    table = build_methods_table_pmstd(METHOD_TO_FILE, precision=2)

    pd.set_option("display.max_colwidth", None)
    pd.set_option("display.width", 200)
    pd.set_option("display.max_columns", None)

    print("\n===== DATAFRAME OUTPUT =====\n")
    print(table)

    print("\n===== LATEX ROWS (paste into the template) =====\n")
    latex_rows = dataframe_rows_to_latex(table)
    print(latex_rows)

    # Optional: save those rows into a file for easy copy/paste
    Path("lpips_ssim_pmstd_rows.tex").write_text(latex_rows, encoding="utf-8")
    print("\nSaved rows to: lpips_ssim_pmstd_rows.tex")
