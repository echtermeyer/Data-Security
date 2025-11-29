import torch
import cv2
import numpy as np
from PIL import Image
from datasets import load_dataset
from imwatermark import WatermarkEncoder, WatermarkDecoder
from diffusers import AutoPipelineForImage2Image
from torchvision import transforms
import matplotlib.pyplot as plt


# --- CONFIGURATION ---
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
W_BENCH_SUBSET_SIZE = 5  # Keep small for M3 testing
SECRET_MSG = "Test12"  # 64-bit equivalent usually required

# --- 1. METHOD WRAPPERS ---


class MethodBase:
    def encode(self, img_pil, msg):
        raise NotImplementedError

    def decode(self, img_pil):
        raise NotImplementedError


class Method_DWTDCT(MethodBase):
    def __init__(self):
        self.enc = WatermarkEncoder()
        self.bits_len = 8 * len(SECRET_MSG)
        self.dec = WatermarkDecoder("bytes", self.bits_len)
        self.scale = [0, 200, 200]
        self.block = 8

    def encode(self, img_pil, msg):
        img_bgr = cv2.cvtColor(np.array(img_pil.convert("RGB")), cv2.COLOR_RGB2BGR)
        self.enc.set_watermark("bytes", msg.encode("utf-8"))
        wm_bgr = self.enc.encode(img_bgr, "dwtDct", scales=self.scale, block=self.block)

        return Image.fromarray(cv2.cvtColor(wm_bgr, cv2.COLOR_BGR2RGB))

    def decode(self, img_pil):
        img_bgr = cv2.cvtColor(np.array(img_pil.convert("RGB")), cv2.COLOR_RGB2BGR)
        wm_bytes = self.dec.decode(
            img_bgr, "dwtDct", scales=self.scale, block=self.block
        )

        try:
            return wm_bytes.decode("utf-8", errors="ignore")
        except:
            return wm_bytes


class Method_DWTDCTSVD(MethodBase):
    def __init__(self):
        # Encoder/decoder from invisible-watermark (imwatermark)
        self.enc = WatermarkEncoder()
        self.bits_len = 8 * len(SECRET_MSG)
        self.dec = WatermarkDecoder("bytes", self.bits_len)

    def encode(self, img_pil, msg):
        # Convert PIL image (RGB) → NumPy BGR (what OpenCV / imwatermark expects)
        img_rgb = np.array(img_pil.convert("RGB"))
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        self.enc.set_watermark("bytes", msg.encode("utf-8"))
        wm_bgr = self.enc.encode(img_bgr, "dwtDctSvd")
        wm_rgb = cv2.cvtColor(wm_bgr, cv2.COLOR_BGR2RGB)
        return Image.fromarray(wm_rgb)

    def decode(self, img_pil):
        # Convert PIL image back to BGR NumPy
        img_rgb = np.array(img_pil.convert("RGB"))
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

        # Decode using the same algorithm
        wm_bytes = self.dec.decode(img_bgr, "dwtDctSvd")

        # Return string so your pipeline's `SECRET_MSG in decoded` works
        try:
            return wm_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return wm_bytes


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
        # No SDXL pipeline here, so nothing big gets downloaded
        pass

    def attack_jpeg(self, img, quality=90):
        img.save("temp.jpg", "JPEG", quality=quality)
        return Image.open("temp.jpg").convert("RGB")

    def attack_crop(self, img, scale=0.5):
        w, h = img.size
        new_w, new_h = int(w * scale), int(h * scale)
        t = transforms.CenterCrop((new_h, new_w))
        return t(img).resize((w, h))

    # You can leave this here for later, but DON'T use it now
    def attack_regeneration(self, img):
        raise RuntimeError(
            "Regeneration attack (SDXL) is disabled for this quick test."
        )


# --- 3. MAIN PIPELINE ---


def run_benchmark(n_samples=1, attack=True):
    print(f"Loading W-Bench (Subset: {n_samples})...")
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    attacker = Attacker()

    methods = {
        "InvisibleWM (DWT-DCT-SVD)": Method_DWTDCTSVD(),
        "InvisibleWM (DWT-DCT)": Method_DWTDCT(),
    }

    results = {m: {"Success": 0, "Total": 0} for m in methods}

    print(f"{'Method':<30} | {'Attack':<15} | {'Decoded'} | {'Success?'}")
    print("-" * 80)

    count = 0
    for sample in dataset:
        if count >= n_samples:
            break

        original = sample["image"].convert("RGB").resize((512, 512))

        for m_name, method in methods.items():
            # 1. Embed
            try:
                watermarked = method.encode(original, SECRET_MSG)
            except Exception as e:
                print(f"{m_name:<30} | {'EmbedError':<15} | {e} | False")
                continue

            # 2. Attack
            if attack:
                attacked = attacker.attack_jpeg(watermarked, 90)
                decoded_msg = method.decode(attacked)
            else:
                decoded_msg = method.decode(watermarked)
                attacked = None
            if isinstance(decoded_msg, bytes):
                decoded_msg = decoded_msg.decode("utf-8", errors="ignore")

            # Show images for first sample only (FIXED: moved condition)
            if count == -1:
                fig, axes = plt.subplots(1, 3, figsize=(12, 4))
                axes[0].imshow(original)
                axes[0].set_title("Original")
                axes[0].axis("off")

                axes[1].imshow(watermarked)
                axes[1].set_title("Watermarked")
                axes[1].axis("off")

                # FIX: Handle case where attacked is None
                if attacked is not None:
                    axes[2].imshow(attacked)
                    axes[2].set_title("Attacked (JPEG)")
                else:
                    # Show watermarked image again or a blank placeholder
                    axes[2].imshow(watermarked)
                    axes[2].set_title("No Attack")

                axes[2].axis("off")
                plt.tight_layout()
                plt.show()

            success = SECRET_MSG in str(decoded_msg)

            print(
                f"{m_name:<30} | {'JPEG(50)':<15} | {repr(decoded_msg):<20} | {success}"
            )

            results[m_name]["Success"] += int(success)
            results[m_name]["Total"] += 1

        count += 1

    print("\n--- FINAL SCORES ---")
    for m, data in results.items():
        acc = (data["Success"] / data["Total"]) * 100 if data["Total"] > 0 else 0
        print(f"{m}: {acc:.1f}% Accuracy")


if __name__ == "__main__":
    run_benchmark(n_samples=3, attack=False)
