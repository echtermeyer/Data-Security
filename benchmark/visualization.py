from __future__ import annotations
import pandas as pd
import matplotlib.pyplot as plt
import json
import os
import argparse


import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Union



def analyze_watermark_results(json_data, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    # --- 1. Parse JSON to DataFrame with Fallback ---
    rows = []
    for entry in json_data:
        res = entry["results"]
        attacks_data = entry.get("attacks")

        # Robustness checks (omitted for brevity)
        if not isinstance(attacks_data, list) or len(attacks_data) < 2:
            att_name = "None"
            param_key = "N/A"
            param_value = "N/A"
        else:
            att_name = attacks_data[0].replace("attack_", "")
            params = attacks_data[1]
            if isinstance(params, dict) and params:
                param_key = list(params.keys())[0]
                param_value = params[param_key]
            else:
                param_key = "N/A"
                param_value = "N/A"

        rows.append(
            {
                "Method": res["m_name"],
                "Attack": att_name,
                "Parameter": param_value,
                "Robustness": res["avg_ratcliff_obershelp_scores"],
                "SSIM": res["avg_ssim_val_scores"],
                "LPIPS": res["avg_lpips_val_scores"],
                "Param_Key": param_key,  # Store key for X-label
            }
        )

    df = pd.DataFrame(rows)

    # 2. Visualize and Save Figures (One file per attack type)
    attacks = df["Attack"].unique()

    for attack in attacks:
        if attack == "None":
            continue

        fig, ax = plt.subplots(figsize=(7, 5))
        subset = df[df["Attack"] == attack]

        # Determine X-axis label dynamically
        x_label_key = subset["Param_Key"].iloc[0]

        for method in subset["Method"].unique():
            data = subset[subset["Method"] == method].sort_values("Parameter")

            # Line 1: Robustness Score (Solid Line)
            ax.plot(
                data["Parameter"],
                data["Robustness"],
                marker="o",
                linestyle="-",
                label=f"{method} (Robustness)",
            )

            # Line 2: Image Quality (SSIM) (Dashed Line)
            ax.plot(
                data["Parameter"],
                data["SSIM"],
                marker="x",
                linestyle="--",
                color=ax.lines[-1].get_color(),
                label=f"{method} (SSIM Quality)",
            )

        # --- Axis Descriptions and Legend ---
        ax.set_title(f"Performance vs. {attack.capitalize()} Strength")
        ax.set_xlabel(f"{x_label_key.capitalize()} Value")
        ax.set_ylabel("Score (0.0 to 1.0)")
        ax.legend(loc="upper right", fontsize="small")
        ax.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f"robustness_plot_{attack}.png"))
        plt.close(fig)

    # 3. Generate and Save LaTeX Table (Unchanged)
    latex_str = df.to_latex(
        index=False,
        float_format="%.3f",
        columns=["Method", "Attack", "Parameter", "Robustness", "SSIM"],
        caption="Watermarking Robustness Results",
        label="tab:watermark_results",
    )

    table_filename = os.path.join(output_dir, "results_table.tex")
    with open(table_filename, "w") as f:
        f.write(latex_str)

    return f"Results saved to directory '{output_dir}'. Figures: {len(attacks) - 1} | Table: '{table_filename}'"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Analyze and visualize watermark robustness results from a JSON file."
    )

    # Required positional argument for input file path
    parser.add_argument(
        "filepath", type=str, help="Path to the input JSON results file."
    )

    # Optional argument for output directory
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./assets",
        help="Directory to save figures and LaTeX table.",
    )

    args = parser.parse_args()

    try:
        with open(args.filepath, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {args.filepath}")
        exit(1)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {args.filepath}")
        exit(1)

    analyze_watermark_results(data, output_dir=args.output_dir)
    print(f"Analysis complete. Results saved to '{args.output_dir}'")



