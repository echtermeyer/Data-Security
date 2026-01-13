import torch
from PIL import Image
from datasets import load_dataset
from difflib import SequenceMatcher
import json
import time
import numpy as np
import cv2
import lpips
from rapidfuzz import fuzz

from vendor.mbrs import Method_MBRS
from vendor.raw import Method_RAW
from vendor.dwtdct import Method_DWTDCT, Method_DWTDCTSVD
from vendor.lsb import Method_LSB, Method_LSB_Robust
from vendor.vine import Method_VINE


from vendor.vine.src.quality_metrics_wbench import (
    compute_psnr_ssim,
    compute_lpips,
)
from vendor.vine.w_bench_utils import Attacker


def run_config(
    n_samples,
    msg,
    attack: tuple,
    device: str,
    loss_fn_alex,
    attacker,
):
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    # m_name, method = "DWT-DCT-SVD", Method_DWTDCTSVD(msg)
    # m_name, method = "DWT-DCT", Method_DWTDCT(len(msg))
    # m_name, method = "LSB", Method_LSB()
    # m_name, method = "LSB Robust", Method_LSB_Robust()
    # m_name, method = "MBRS", Method_MBRS(device)
    m_name, method = "RAW", Method_RAW()
    # m_name, method = "MVINEBRS", Method_VINE(device)

    # print(f"{'Method':<30} | {'Attack':<15} | {'Decoded'} | {'Success?'}")
    # print("-" * 80)
    start_time = time.perf_counter()
    count = 0

    ratcliff_obershelp_scores = list()
    lambdaevenshtein_scores = list()
    jaccard_scores = list()
    acc_scores = list()
    psnr_val_scores = list()
    ssim_val_scores = list()
    lpips_val_scores = list()
    for sample in dataset:
        if count >= n_samples:
            break

        original = sample["image"].convert("RGB").resize((512, 512))

        try:
            watermarked = method.encode(original, msg)
        except Exception as e:
            print(f"{m_name:<30} | {'EmbedError':<15} | {e} | False")
            continue
        attacked_img = watermarked
        if attack:
            attacked_img = getattr(attacker, attack[0])(attacked_img, **attack[1])
        try:
            # original & attacked are PIL RGB → convert to BGR NumPy arrays
            decoded_cv = cv2.cvtColor(np.array(attacked_img), cv2.COLOR_RGB2BGR)
            original_cv = cv2.cvtColor(np.array(original), cv2.COLOR_RGB2BGR)

            psnr_val, ssim_val = compute_psnr_ssim(decoded_cv, original_cv)
            lpips_val = compute_lpips(decoded_cv, original_cv, loss_fn_alex, device)
        except Exception as e:
            psnr_val, ssim_val, lpips_val = float("nan"), float("nan"), float("nan")
            print(f"{m_name:<30} | MetricError     | {e} | False")

        decoded_msg = method.decode(attacked_img)
        if isinstance(decoded_msg, bytes):
            decoded_msg = decoded_msg.decode("utf-8", errors="ignore")

        # TODO: get success rate (e.g. fuzzy matching)
        if isinstance(decoded_msg, str):
            ratcliff_obershelp_match = SequenceMatcher(None, msg, decoded_msg).ratio()
            lambdaevenshtein_match = fuzz.ratio("mysfits", "misfits")
            a, b = set(msg), set(decoded_msg)
            jaccard_match = float(len(a.intersection(b))) / len(a.union(b))
            ratcliff_obershelp_scores.append(ratcliff_obershelp_match)
            lambdaevenshtein_scores.append(lambdaevenshtein_match)
            jaccard_scores.append(jaccard_match)
        else:  # in case of non-str return
            acc = decoded_msg
            acc_scores.append(acc)
        # print(
        #     f"{m_name:<30} | {str(attack):<15} | {repr(match_rate):<20}",
        #     f"| PSNR={psnr_val:.2f} SSIM={ssim_val:.4f} LPIPS={lpips_val:.4f}",
        # )

        psnr_val_scores.append(psnr_val)
        ssim_val_scores.append(ssim_val)
        lpips_val_scores.append(lpips_val)

        count += 1
    end_time = time.perf_counter()
    elapsed_time = end_time - start_time
    if ratcliff_obershelp_scores:
        ratcliff_obershelp_scores_np = np.array(ratcliff_obershelp_scores)
        lambdaevenshtein_scores_np = np.array(lambdaevenshtein_scores)
        jaccard_scores_np = np.array(jaccard_scores)
        acc_scores_np = None
        avg_ratcliff_obershelp_scores = float(np.mean(ratcliff_obershelp_scores_np))
        std_ratcliff_obershelp_scores = float(np.std(ratcliff_obershelp_scores_np))
        avg_lambdaevenshtein_scores = float(np.mean(lambdaevenshtein_scores_np))
        std_lambdaevenshtein_scores = float(np.std(lambdaevenshtein_scores_np))
        avg_jaccard_scores = float(np.mean(jaccard_scores_np))
        std_jaccard_scores = float(np.std(jaccard_scores_np))
        avg_acc_scores = None
        std_acc_scores = None
    else:
        acc_scores_np = np.array(acc_scores)
        avg_ratcliff_obershelp_scores = None
        std_ratcliff_obershelp_scores = None
        avg_lambdaevenshtein_scores = None
        std_lambdaevenshtein_scores = None
        avg_jaccard_scores = None
        std_jaccard_scores = None
        avg_acc_scores = float(np.mean(acc_scores_np))
        std_acc_scores = float(np.std(acc_scores_np))

    psnr_val_scores_np = np.array(psnr_val_scores)
    ssim_val_scores_np = np.array(ssim_val_scores)
    lpips_val_scores_np = np.array(lpips_val_scores)
    final_results = {
        "avg_ratcliff_obershelp_scores": avg_ratcliff_obershelp_scores,
        "std_ratcliff_obershelp_scores": std_ratcliff_obershelp_scores,
        "avg_lambdaevenshtein_scores": avg_lambdaevenshtein_scores,
        "std_lambdaevenshtein_scores": std_lambdaevenshtein_scores,
        "avg_jaccard_scores": avg_jaccard_scores,
        "std_jaccard_scores": std_jaccard_scores,
        "avg_acc_scores": avg_acc_scores,
        "std_acc_scores": std_acc_scores,
        "psnr_val_scores_scores": float(np.mean(psnr_val_scores_np)),
        "psnr_val_scores_scores": float(np.std(psnr_val_scores_np)),
        "avg_ssim_val_scores": float(np.mean(ssim_val_scores_np)),
        "std_ssim_val_scores": float(np.std(ssim_val_scores_np)),
        "avg_lpips_val_scores": float(np.mean(lpips_val_scores_np)),
        "std_lpips_val_scores": float(np.std(lpips_val_scores_np)),
        "time_per_image_sec": elapsed_time / count,
        "m_name": m_name,
    }
    return final_results


def run_benchmark():
    DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
    W_BENCH_SUBSET_SIZE = 100

    loss_fn_alex = lpips.LPIPS(net="alex").to(DEVICE)

    attacker = Attacker()

    attacks = [
        ("attack_brightness", {"factor": 0.5}),
        ("attack_brightness", {"factor": 0.7}),
        ("attack_brightness", {"factor": 0.9}),
        ("attack_brightness", {"factor": 1.1}),
        ("attack_brightness", {"factor": 1.3}),
        ("attack_brightness", {"factor": 1.5}),
        ("attack_brightness", {"factor": 2.0}),
        # --- Distortion Attacks (Contrast) ---
        ("attack_contrast", {"factor": 0.5}),
        ("attack_contrast", {"factor": 0.8}),
        ("attack_contrast", {"factor": 1.2}),
        ("attack_contrast", {"factor": 1.5}),
        ("attack_contrast", {"factor": 2.0}),
        # --- Distortion Attacks (Blur - Kernel Size) ---
        ("attack_blur", {"kernel_size": 1}),
        ("attack_blur", {"kernel_size": 3}),
        ("attack_blur", {"kernel_size": 5}),
        ("attack_blur", {"kernel_size": 7}),
        ("attack_blur", {"kernel_size": 9}),
        # --- Distortion Attacks (Noise - Standard Deviation) ---
        ("attack_noise", {"std": 0.01}),
        ("attack_noise", {"std": 0.03}),
        ("attack_noise", {"std": 0.05}),
        ("attack_noise", {"std": 0.08}),
        ("attack_noise", {"std": 0.1}),
        # --- Distortion Attacks (JPEG Quality) ---
        ("attack_jpeg", {"quality": 90}),
        ("attack_jpeg", {"quality": 80}),
        ("attack_jpeg", {"quality": 70}),
        ("attack_jpeg", {"quality": 60}),
        ("attack_jpeg", {"quality": 50}),
        ("attack_jpeg", {"quality": 40}),
        ("attack_jpeg", {"quality": 30}),
        ("attack_jpeg", {"quality": 20}),
        ("attack_jpeg", {"quality": 10}),
        # --- Geometric Attacks (Rotate) ---
        ("attack_rotate", {"degree": 5}),
        ("attack_rotate", {"degree": 10}),
        ("attack_rotate", {"degree": 15}),
        ("attack_rotate", {"degree": 30}),
        ("attack_rotate", {"degree": 45}),
        ("attack_rotate", {"degree": 90}),
        # --- Geometric Attacks (Scale) ---
        ("attack_scale", {"scale": 0.9}),
        ("attack_scale", {"scale": 0.75}),
        ("attack_scale", {"scale": 0.5}),
        ("attack_scale", {"scale": 0.25}),
        # --- Geometric Attacks (Crop - Fraction Kept) ---
        ("attack_crop", {"crop_size": 0.9}),
        ("attack_crop", {"crop_size": 0.8}),
        ("attack_crop", {"crop_size": 0.6}),
        ("attack_crop", {"crop_size": 0.4}),
        ("attack_crop", {"crop_size": 0.2}),
        # --- Regeneration Attacks (Diffusion - Noise Step) ---
        # ("attack_diffusion", {"noise_step": 20, "prompt": ""}),
        # ("attack_diffusion", {"noise_step": 40, "prompt": ""}),
        # ("attack_diffusion", {"noise_step": 60, "prompt": ""}),
        # ("attack_diffusion", {"noise_step": 80, "prompt": ""}),
        # ("attack_diffusion", {"noise_step": 100, "prompt": ""}),
        # # --- Global Editing (InstructPix2Pix) ---
        # (
        #     "attack_global_edit_instructpix2pix",
        #     {"prompt": "Make it look like a painting"},
        # ),
        # (
        #     "attack_global_edit_instructpix2pix",
        #     {"prompt": "Turn this into a pencil sketch"},
        # ),
        # (
        #     "attack_global_edit_instructpix2pix",
        #     {"prompt": "Make the image black and white"},
        # ),
        # ("attack_global_edit_instructpix2pix", {"prompt": "Add fireworks to the sky"}),
        # # --- Global Editing (UltraEdit) ---
        # ("attack_global_edit_ultraedit", {"prompt": "Make it darker"}),
        # ("attack_global_edit_ultraedit", {"prompt": "Make it brighter"}),
        # ("attack_global_edit_ultraedit", {"prompt": "Make it look like a cartoon"}),
        # ("attack_global_edit_ultraedit", {"prompt": "Increase the contrast"}),
        # # --- Local Editing (ControlNet - Applied Globally with mask=None) ---
        # (
        #     "attack_local_edit_controlnet",
        #     {"mask": None, "prompt": "remove the background"},
        # ),
        # (
        #     "attack_local_edit_controlnet",
        #     {"mask": None, "prompt": "replace with a beach scene"},
        # ),
        # # --- Local Editing (UltraEdit - Applied Globally with mask=None) ---
        # (
        #     "attack_local_edit_ultraedit",
        #     {"mask": None, "prompt": "blur the background"},
        # ),
        # (
        #     "attack_local_edit_ultraedit",
        #     {"mask": None, "prompt": "change the weather to rainy"},
        # ),
        None,
    ]
    messages = [
        "Hi",  # len 2
        "Carl",  # len 4
        "Tubingen",  # len 8
        "CanYouSeeMeHere",  # len 16
        "HowCoolIsWaterBench?LikeyCooool!",  # len 32
    ]
    results = []
    for msg in messages:
        print(f"\n=== Benchmarking with message: '{msg}' ===\n")
        for attack in attacks:
            print(f"\n=== Benchmarking with attack: '{attack}' ===\n")
            result = run_config(
                n_samples=W_BENCH_SUBSET_SIZE,
                msg=msg,
                attack=attack,
                device=DEVICE,
                loss_fn_alex=loss_fn_alex,
                attacker=attacker,
            )
            results.append(
                {
                    "attacks": attack,
                    "message": msg,
                    "results": result,
                }
            )
    file_name = f"./results/{results[0]['results']['m_name']}_benchmark_results.json"
    with open(file_name, "w") as f:
        json.dump(results, f, indent=4)
    print(f"Benchmark results saved to {file_name}")


if __name__ == "__main__":
    run_benchmark()
