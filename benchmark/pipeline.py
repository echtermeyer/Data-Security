import torch
import cv2
import numpy as np
from PIL import Image
from datasets import load_dataset
from invisible_watermark import WatermarkEncoder, WatermarkDecoder
from diffusers import AutoPipelineForImage2Image
from torchvision import transforms

# --- CONFIGURATION ---
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
W_BENCH_SUBSET_SIZE = 5  # Keep small for M3 testing
SECRET_MSG = "Test1234"  # 64-bit equivalent usually required

# --- 1. METHOD WRAPPERS ---


class MethodBase:
    def encode(self, img_pil, msg):
        raise NotImplementedError

    def decode(self, img_pil):
        raise NotImplementedError


class Method_DWTDCTSVD(MethodBase):
    def __init__(self):
        self.enc = WatermarkEncoder()
        self.dec = WatermarkDecoder("dwtDctSvd")
        self.enc.set_watermark("bytes", msg=SECRET_MSG.encode("utf-8"))

    def encode(self, img_pil, msg):
        img_np = np.array(img_pil)
        # Note: simplistic byte encoding for demo
        wm_img_np = self.enc.encode(img_np, "dwtDctSvd")
        return Image.fromarray(wm_img_np)

    def decode(self, img_pil):
        return self.dec.decode(np.array(img_pil), "dwtDctSvd")


class Method_LSB(MethodBase):
    def encode(self, img_pil, msg):
        # Simple 1-bit LSB implementation
        img = np.array(img_pil)
        bin_msg = "".join(format(ord(i), "08b") for i in msg)
        flat = img.flatten()
        if len(bin_msg) > len(flat):
            raise ValueError("Msg too long")
        for i, bit in enumerate(bin_msg):
            flat[i] = (flat[i] & 0xFE) | int(bit)
        return Image.fromarray(flat.reshape(img.shape))

    def decode(self, img_pil):
        # Decodes first 64 bits (8 chars)
        img = np.array(img_pil).flatten()
        bin_msg = "".join([str(x & 1) for x in img[:64]])
        chars = [chr(int(bin_msg[i : i + 8], 2)) for i in range(0, 64, 8)]
        return "".join(chars)


# --- PLACEHOLDERS FOR DEEP METHODS (Requires External Repos) ---
class Method_Deep_Template(MethodBase):
    def __init__(self, model_path):
        # Load your model here (StegaStamp/MBRS/RAW)
        # self.model = torch.load(model_path).to(DEVICE)
        pass

    def encode(self, img_pil, msg):
        # return self.model.embed(img_pil, msg)
        return img_pil  # Pass-through for now

    def decode(self, img_pil):
        # return self.model.detect(img_pil)
        return SECRET_MSG  # Dummy return


# --- 2. ATTACK SIMULATION (W-BENCH STYLE) ---


class Attacker:
    def __init__(self):
        # W-Bench "Regeneration" Attack using SDXL-Turbo (Fast on M3)
        self.pipe = AutoPipelineForImage2Image.from_pretrained(
            "stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16"
        ).to(DEVICE)
        self.pipe.set_progress_bar_config(disable=True)

    def attack_jpeg(self, img, quality=50):
        img.save("temp.jpg", "JPEG", quality=quality)
        return Image.open("temp.jpg")

    def attack_crop(self, img, scale=0.5):
        w, h = img.size
        new_w, new_h = int(w * scale), int(h * scale)
        t = transforms.CenterCrop((new_h, new_w))
        return t(img).resize((w, h))

    def attack_regeneration(self, img):
        # Strength 0.3 mimics subtle "regeneration" that destroys fragiles
        return self.pipe(
            prompt="high quality image",
            image=img,
            strength=0.3,
            guidance_scale=0.0,
            num_inference_steps=1,
        ).images[0]


# --- 3. MAIN PIPELINE ---


def run_benchmark():
    print(f"Loading W-Bench (Subset: {W_BENCH_SUBSET_SIZE})...")
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    attacker = Attacker()

    # Register Methods
    methods = {
        "LSB (Spatial)": Method_LSB(),
        "DWT-DCT-SVD": Method_DWTDCTSVD(),
        # "StegaStamp": Method_Deep_Template("path/to/stega.pth"),
        # "MBRS": Method_Deep_Template("path/to/mbrs.pth")
    }

    results = {m: {"Success": 0, "Total": 0} for m in methods}

    print(f"{'Method':<15} | {'Attack':<15} | {'Detected?'}")
    print("-" * 45)

    count = 0
    for sample in dataset:
        if count >= W_BENCH_SUBSET_SIZE:
            break
        original = sample["image"].convert("RGB").resize((512, 512))

        for m_name, method in methods.items():
            # 1. Embed
            try:
                watermarked = method.encode(original, SECRET_MSG)
            except:
                continue  # Skip if method fails

            # 2. Attack (Run one specific attack, e.g., Regeneration)
            attacked = attacker.attack_regeneration(watermarked)
            # attacked = attacker.attack_jpeg(watermarked, 50)

            # 3. Detect
            decoded_msg = method.decode(attacked)

            # 4. Metric (Bit Match)
            # Simple check: is the decoded string inside the result?
            # (Real benchmark calculates Bit Error Rate)
            success = 0
            if isinstance(decoded_msg, bytes):
                decoded_msg = decoded_msg.decode("utf-8", errors="ignore")
            if SECRET_MSG in str(decoded_msg):
                success = 1

            results[m_name]["Success"] += success
            results[m_name]["Total"] += 1

            print(f"{m_name:<15} | {'Regen(0.3)':<15} | {bool(success)}")

        count += 1

    print("\n--- FINAL SCORES ---")
    for m, data in results.items():
        acc = (data["Success"] / data["Total"]) * 100 if data["Total"] > 0 else 0
        print(f"{m}: {acc:.1f}% Accuracy")


if __name__ == "__main__":
    run_benchmark()
