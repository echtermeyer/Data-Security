import torch
from PIL import Image
from datasets import load_dataset
from diffusers import AutoPipelineForImage2Image
from torchvision import transforms
import matplotlib.pyplot as plt
from difflib import SequenceMatcher
import json
import time
import numpy as np
import cv2
import lpips




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


def run_config(n_samples, msg, attacks: list[tuple], device: str, loss_fn_alex):
    print(f"Loading W-Bench (Subset: {n_samples})...")
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    m_name, method = "InvisibleWM (DWT-DCT-SVD)", Method_DWTDCTSVD(msg)
    m_name, method = "InvisibleWM (DWT-DCT)", Method_DWTDCT(msg)
    m_name, method = "LSB", Method_LSB()
    m_name, method = "LSB Robust", Method_LSB_Robust()
    m_name, method = "MBRS", Method_MBRS(device)
    m_name, method = "RAW", Method_RAW()
    m_name, method = "MVINEBRS", Method_VINE(device)

    print(f"{'Method':<30} | {'Attack':<15} | {'Decoded'} | {'Success?'}")
    print("-" * 80)
    start_time = time.perf_counter()
    count = 0

    score = list()
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
        if attacks:
            attacker = Attacker()
            for attack, kwargs in attacks:
                attacked_img = getattr(attacker, attack)(attacked_img, **kwargs)

              # compute PSNR, SSIM, LPIPS using quality_metrics_wbench
            try:
                # original & attacked are PIL RGB → convert to BGR NumPy arrays
                decoded_cv = cv2.cvtColor(np.array(attacked), cv2.COLOR_RGB2BGR)
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
            match_rate = SequenceMatcher(None, msg, decoded_msg).ratio()
        else:  # in case of non-str return
            match_rate = decoded_msg
        print(f"{m_name:<30} | {str(attacks):<15} | {repr(match_rate):<20} | {match_rate}",
                 f"| PSNR={psnr_val:.2f} SSIM={ssim_val:.4f} LPIPS={lpips_val:.4f}")

        score.append(match_rate)

        count += 1
    end_time = time.perf_counter()
    elapsed_time = end_time - start_time
    np_res = np.array(score)
    final_results = {
        "avg_match_rate": float(np.mean(np_res)),
        "std_match_rate": float(np.std(np_res)),
        "time_per_image_sec": elapsed_time / len(score),
    }
    return final_results


def run_benchmark():
    DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
    W_BENCH_SUBSET_SIZE = 5

    loss_fn_alex = lpips.LPIPS(net='alex').to(DEVICE)

    attacker = Attacker()

    attacks = [
        # [("attack_jpeg", {"quality": 10})],
        # [("attack_jpeg", {"quality": 20})],
        # [("attack_jpeg", {"quality": 30})],
        # [("attack_jpeg", {"quality": 40})],
        # [("attack_jpeg", {"quality": 50})],
        # [("attack_jpeg", {"quality": 60})],
        # [("attack_jpeg", {"quality": 70})],
        # [("attack_jpeg", {"quality": 80})],
        [("attack_jpeg", {"quality": 90})],
        [],
    ]
    messages = [
        # "Hi",  # len 2
        # "Carl",  # len 4
        # "Tubingen",  # len 8
        "CanYouSeeMeHere",  # len 16
    ]
    restults = []
    for msg in messages:
        print(f"\n=== Benchmarking with message: '{msg}' ===\n")
        for attack in attacks:
            print(f"\n=== Benchmarking with attack: '{attack}' ===\n")
            result = run_config(
                n_samples=W_BENCH_SUBSET_SIZE, msg=msg, attacks=attack, device=DEVICE, loss_fn_alex=loss_fn_alex,
            )
            restults.append({"attacks": attack, "message": msg, "results": result, "device": DEVICE, "loss_fn_alex": loss_fn_alex})

    with open("benchmark_results.json", "w") as f:
        json.dump(restults, f, indent=4)
    print("Benchmark results saved to benchmark_results.json")


if __name__ == "__main__":
    run_benchmark()
