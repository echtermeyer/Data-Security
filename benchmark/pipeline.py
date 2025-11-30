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


from vendor.mbrs import Method_MBRS
from vendor.raw import Method_RAW
from vendor.dwtdct import Method_DWTDCT, Method_DWTDCTSVD
from vendor.lsb import Method_LSB, Method_LSB_Robust
from vendor.vine import Method_VINE
from vendor.vine.w_bench_utils import Attacker


# class Attacker:
#     def __init__(self):
#         # No SDXL pipeline here, so nothing big gets downloaded
#         pass

#     def attack_jpeg(self, img, quality=50):
#         img.save("temp.jpg", "JPEG", quality=quality)
#         return Image.open("temp.jpg").convert("RGB")

#     def attack_crop(self, img, scale=0.5):
#         w, h = img.size
#         new_w, new_h = int(w * scale), int(h * scale)
#         t = transforms.CenterCrop((new_h, new_w))
#         return t(img).resize((w, h))

#     # You can leave this here for later, but DON'T use it now
#     def attack_regeneration(self, img):
#         raise RuntimeError(
#             "Regeneration attack (SDXL) is disabled for this quick test."
#         )


def run_config(n_samples, msg, attack: tuple, device: str):
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    m_name, method = "InvisibleWM (DWT-DCT-SVD)", Method_DWTDCTSVD(msg)
    # m_name, method = "InvisibleWM (DWT-DCT)", Method_DWTDCT(msg)
    # m_name, method = "LSB", Method_LSB()
    # m_name, method = "LSB Robust", Method_LSB_Robust()
    # m_name, method = "MBRS", Method_MBRS(device)
    # m_name, method = "RAW", Method_RAW()
    # m_name, method = "MVINEBRS", Method_VINE(device)

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
        if attack:
            attacker = Attacker()
            attacked_img = getattr(attacker, attack[0])(attacked_img, **attack[1])
        decoded_msg = method.decode(attacked_img)
        if isinstance(decoded_msg, bytes):
            decoded_msg = decoded_msg.decode("utf-8", errors="ignore")

        # TODO: get success rate (e.g. fuzzy matching)
        if isinstance(decoded_msg, str):
            match_rate = SequenceMatcher(None, msg, decoded_msg).ratio()
        else:  # in case of non-str return
            match_rate = decoded_msg
        print(f"{m_name:<30} | {str(attack):<15} | {repr(match_rate):<20}")

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
        ("attack_diffusion", {"noise_step": 20, "prompt": ""}),
        ("attack_diffusion", {"noise_step": 40, "prompt": ""}),
        ("attack_diffusion", {"noise_step": 60, "prompt": ""}),
        ("attack_diffusion", {"noise_step": 80, "prompt": ""}),
        ("attack_diffusion", {"noise_step": 100, "prompt": ""}),
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
                n_samples=W_BENCH_SUBSET_SIZE, msg=msg, attack=attack, device=DEVICE
            )
            restults.append({"attacks": attack, "message": msg, "results": result})

    with open("benchmark_results.json", "w") as f:
        json.dump(restults, f, indent=4)
    print("Benchmark results saved to benchmark_results.json")


if __name__ == "__main__":
    run_benchmark()
