import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import pandas as pd

# --- Constants ---
METHOD_TO_FILE: Dict[str, str] = {
    "DWT-DCT": "results/DWT-DCT_benchmark_results.json",
    "LBS": "results/LBS_benchmark_results.json",
    "MBRS": "results/MBRS_benchmark_results.json",
    "RAW": "results/RAW_benchmark_results.json",
    "VINE": "results/LBS_benchmark_results.json",
}

LENGTH_ALIAS: Dict[int, int] = {31: 32}
SAMPLE_SIZE = 100

# --- Helper Functions ---
def clean_message(msg: str) -> str:
    if msg is None: return ""
    msg = str(msg)
    msg = re.sub(r"\s+", " ", msg).strip()
    msg = re.sub(r"(?:\s+00)+$", "", msg).strip()
    return msg

def mean_pm_std(mean, std) -> str:
    if pd.isna(mean) or pd.isna(std): return "-"
    return f"{mean:.2f} $\\pm$ {std:.2f}"

def sanitize_attack_name(name: str) -> str:
    """Formats 'attack_blur' to 'Attack Blur' for headers."""
    return name.replace("_", " ").title()

def load_all_results(method_to_file: Dict[str, str]) -> pd.DataFrame:
    all_rows = []
    for method, filepath in method_to_file.items():
        fp = Path(filepath)
        if not fp.exists(): continue
        data = json.loads(fp.read_text(encoding="utf-8"))
        for item in data:
            attacks = item.get("attacks", [])
            if not attacks:
                attack_type = "none"
            elif isinstance(attacks, dict):
                attack_type = list(attacks.keys())[0] if attacks else "none"
            elif isinstance(attacks, list):
                first_attack = attacks[0]
                attack_type = list(first_attack.keys())[0] if isinstance(first_attack, dict) else str(first_attack)
            else:
                attack_type = "unknown"

            r = item.get("results", {}) or {}
            msg = clean_message(item.get("message", ""))
            msg_len = len(msg)
            msg_len_group = LENGTH_ALIAS.get(msg_len, msg_len)

            all_rows.append({
                "method": method,
                "attack": attack_type,
                "length": msg_len_group,
                "ratcliff_mean": r.get("avg_ratcliff_obershelp_scores"),
                "ratcliff_std": r.get("std_ratcliff_obershelp_scores"),
                "jaccard_mean": r.get("avg_jaccard_scores"),
                "jaccard_std": r.get("std_jaccard_scores"),
            })
    return pd.DataFrame(all_rows)

def make_styled_latex_table(df: pd.DataFrame, attack_type: str) -> str:
    """Generates a table matching the exact multi-row header style requested."""
    # Group and aggregate
    agg = df.groupby(["method", "length"], as_index=False).agg({
        "ratcliff_mean": "mean", "ratcliff_std": "mean",
        "jaccard_mean": "mean", "jaccard_std": "mean"
    })

    agg["Ratcliff"] = agg.apply(lambda r: mean_pm_std(r["ratcliff_mean"], r["ratcliff_std"]), axis=1)
    agg["Jaccard"] = agg.apply(lambda r: mean_pm_std(r["jaccard_mean"], r["jaccard_std"]), axis=1)

    wide = agg.pivot(index="method", columns="length", values=["Ratcliff", "Jaccard"])
    wide = wide.swaplevel(0, 1, axis=1).sort_index(axis=1, level=0)
    
    lengths = sorted(wide.columns.get_level_values(0).unique())
    n_cols = len(lengths) * 2
    display_attack = sanitize_attack_name(attack_type)
    attack_caption_suffix = "No attack applied." if attack_type == "none" else f"Attack: {display_attack}."

    # Build Body
    body_lines = []
    for method, row in wide.iterrows():
        vals = []
        for L in lengths:
            vals.append(str(row.get((L, "Ratcliff"), "-")))
            vals.append(str(row.get((L, "Jaccard"), "-")))
        body_lines.append(f"{method} & " + " & ".join(vals) + " \\\\")

    # Construct Headers
    len_headers = " & ".join([f"\\multicolumn{{2}}{{c}}{{{L}}}" for L in lengths])
    cmid_groups = "".join([f"\\cmidrule(lr){{{2+i*2}-{3+i*2}}}" for i in range(len(lengths))])
    metric_subheaders = " & ".join(["Ratcliff", "Jaccard"] * len(lengths))
    
    # Generate column widths for the CC columns
    col_widths = " ".join([">{\\centering\\arraybackslash}p{1.25cm}"] * n_cols)

    return f"""
\\begin{{table*}}[h!]
\\centering
\\footnotesize
\\setlength{{\\tabcolsep}}{{3pt}}
\\renewcommand{{\\arraystretch}}{{1.15}}

\\begin{{tabular}}{{>{{\\raggedright\\arraybackslash}}p{{2.2cm}} {col_widths}}}
\\toprule
\\multirow[b]{{4}}{{*}}{{\\raisebox{{-0.6ex}}{{\\textbf{{Method}}}}}} 
& \\multicolumn{{{n_cols}}}{{c}}{{\\textbf{{Message length}}}} \\\\
\\cmidrule(lr){{2-{1+n_cols}}}
& {len_headers} \\\\
{cmid_groups}
& \\multicolumn{{{n_cols}}}{{c}}{{\\textbf{{Similarity score}}}} \\\\
\\cmidrule(lr){{2-{1+n_cols}}}
& {metric_subheaders} \\\\
\\midrule
{"\n".join(body_lines)}
\\bottomrule
\\end{{tabular}}

\\vspace{{6pt}}
\\caption{{Ratcliff/Obershelp and Jaccard (mean $\\pm$ std) across methods and message lengths. {attack_caption_suffix}}}
\\label{{tab:results-{attack_type}}}
\\end{{table*}}
"""

if __name__ == "__main__":
    full_df = load_all_results(METHOD_TO_FILE)
    
    for attack in full_df["attack"].unique():
        attack_df = full_df[full_df["attack"] == attack]
        latex_code = make_styled_latex_table(attack_df, attack)
        
        filename = f"table_results_{attack}.tex"
        Path(filename).write_text(latex_code, encoding="utf-8")
        print(f"Generated: {filename}")