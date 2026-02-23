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
    # Handles cases where scores are null/None in JSON
    if mean is None or std is None or pd.isna(mean) or pd.isna(std): 
        return "-"
    return f"{mean:.2f} $\\pm$ {std:.2f}"

def sanitize_attack_name(name: str) -> str:
    return name.replace("_", " ").title()

def load_all_results(method_to_file: Dict[str, str]) -> pd.DataFrame:
    all_rows = []
    for method, filepath in method_to_file.items():
        fp = Path(filepath)
        if not fp.exists(): continue
        
        data = json.loads(fp.read_text(encoding="utf-8"))
        for item in data:
            # Handle attack detection
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
                "accuracy_mean": r.get("avg_acc_scores"), # New Accuracy Key
                "accuracy_std": r.get("std_acc_scores"),   # New Accuracy Key
            })
    return pd.DataFrame(all_rows)

def make_styled_latex_table(df: pd.DataFrame, attack_type: str) -> str:
    # Group and aggregate
    agg = df.groupby(["method", "length"], as_index=False).agg({
        "ratcliff_mean": "mean", "ratcliff_std": "mean",
        "accuracy_mean": "mean", "accuracy_std": "mean"
    })

    agg["Ratcliff"] = agg.apply(lambda r: mean_pm_std(r["ratcliff_mean"], r["ratcliff_std"]), axis=1)
    agg["Accuracy"] = agg.apply(lambda r: mean_pm_std(r["accuracy_mean"], r["accuracy_std"]), axis=1)

    wide = agg.pivot(index="method", columns="length", values=["Ratcliff", "Accuracy"])
    wide = wide.swaplevel(0, 1, axis=1).sort_index(axis=1, level=0)
    
    lengths = sorted(wide.columns.get_level_values(0).unique())
    n_cols = len(lengths) * 2
    display_attack = sanitize_attack_name(attack_type)
    attack_caption_suffix = "No attack applied." if attack_type == "none" else f"Attack: {display_attack}."

    # Build Table Rows
    body_lines = []
    for method, row in wide.iterrows():
        vals = []
        for L in lengths:
            vals.append(str(row.get((L, "Ratcliff"), "-")))
            vals.append(str(row.get((L, "Accuracy"), "-")))
        body_lines.append(f"{method} & " + " & ".join(vals) + " \\\\")

    # Construct Headers to match your desired p{1.25cm} style
    len_headers = " & ".join([f"\\multicolumn{{2}}{{c}}{{{L}}}" for L in lengths])
    cmid_groups = "".join([f"\\cmidrule(lr){{{2+i*2}-{3+i*2}}}" for i in range(len(lengths))])
    metric_subheaders = " & ".join(["Ratcliff", "Accuracy"] * len(lengths))
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
\\caption{{Ratcliff/Obershelp and Accuracy (mean $\\pm$ std) across methods and message lengths. {attack_caption_suffix}}}
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