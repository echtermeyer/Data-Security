import torch
import cv2
import numpy as np
from PIL import Image
from datasets import load_dataset
from imwatermark import WatermarkEncoder, WatermarkDecoder
from diffusers import AutoPipelineForImage2Image
from torchvision import transforms
import matplotlib.pyplot as plt
from torchvision.transforms.functional import to_tensor, to_pil_image

from vendor.raw.scripts import raw, tools
import os
import json

from vendor.mbrs.network.Network import Network

# you can add more if you like, but this is the one we need explicitly


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


class Method_MBRS(MethodBase):
    def __init__(self):
        # --- 1) Load config from vendor/mbrs/test_settings.json directly ---
        # Resolve path: pipeline.py is in benchmark/, so vendor/mbrs is below it
        here = os.path.dirname(__file__)
        cfg_path = os.path.join(here, "vendor", "mbrs", "test_settings.json")

        with open(cfg_path, "r") as f:
            cfg = json.load(f)

        # Adjust these keys if names differ in your JSON
        self.H = cfg.get("H", 256)
        self.W = cfg.get("W", 256)
        self.message_length = cfg.get("message_length", 64)
        self.strength_factor = cfg.get("strength_factor", 1.0)

        batch_size = cfg.get("batch_size", 1)
        lr = cfg.get("lr", 1e-4)
        with_diffusion = cfg.get("with_diffusion", False)
        noise_layers = cfg.get("noise_layers", [])

        # --- where MBRS files live, relative to this pipeline.py ---
        # Your model is at:
        #   vendor/mbrs/results/MBRS_256_m256/models/EC_42.pth
        base_mbrs_dir = os.path.join(here, "vendor", "mbrs", "results")
        result_folder = os.path.join(base_mbrs_dir, "MBRS_256_m256")
        model_epoch = cfg.get("model_epoch", 42)  # EC_42.pth

        self._result_folder = result_folder
        self._model_epoch = model_epoch

        # --- 2) Device & network ---
        self.device = DEVICE  # "mps" or "cpu" from your config

        self.network = Network(
            self.H,
            self.W,
            self.message_length,
            noise_layers,
            self.device,
            batch_size,
            lr,
            with_diffusion,
        )

        # Path to encoder/decoder checkpoint (absolute path)
        EC_path = os.path.join(result_folder, "models", f"EC_{model_epoch}.pth")
        print("Loading MBRS model from:", EC_path)
        print("Exists?", os.path.exists(EC_path))  # debug

        self.network.load_model_ed(EC_path, self.device)

        self.network.encoder_decoder.eval()
        self.network.discriminator.eval()

        # --- 3) Preprocessing ---
        self.to_tensor = transforms.Compose(
            [
                transforms.Resize((self.H, self.W)),
                transforms.ToTensor(),  # [0,1]
            ]
        )
        self.to_pil = transforms.ToPILImage()

    # ---------- helpers ----------

    def _string_to_bits(self, msg: str) -> torch.Tensor:
        # Encode message to bytes
        msg_bytes = msg.encode("utf-8")
        msg_len = len(msg_bytes)

        # We store the length in the first byte (8 bits)
        if msg_len > 255:
            raise ValueError(
                "Message too long: max 255 bytes supported with 1-byte length prefix."
            )

        # First 8 bits: length
        length_bits = format(msg_len, "08b")
        # Then the message bytes as bits
        msg_bits = "".join(format(b, "08b") for b in msg_bytes)

        payload_bits = length_bits + msg_bits  # total bits we actually care about

        # Pad with zeros up to self.message_length (MBRS expects fixed length)
        if len(payload_bits) > self.message_length:
            raise ValueError(
                f"message_length={self.message_length} too small for msg_len={msg_len} "
                f"(needs at least {len(payload_bits)} bits)."
            )

        bits = payload_bits + "0" * (self.message_length - len(payload_bits))
        bit_list = [float(b) for b in bits]
        return torch.tensor(bit_list, dtype=torch.float32)

    def _bits_to_string(self, bit_tensor: torch.Tensor) -> str:
        # Threshold to {0,1}
        bits = (bit_tensor > 0.5).int().cpu().numpy().tolist()

        # Need at least 8 bits for the length header
        if len(bits) < 8:
            return ""

        # First 8 bits → length in bytes
        length_bits = bits[:8]
        msg_len = int("".join(str(b) for b in length_bits), 2)

        # Next msg_len bytes → the message itself
        msg_bits = bits[8 : 8 + msg_len * 8]

        if len(msg_bits) < msg_len * 8:
            # corrupted / heavily attacked, can't reconstruct cleanly
            return ""

        bytes_out = []
        for i in range(0, len(msg_bits), 8):
            byte_bits = msg_bits[i : i + 8]
            byte_val = int("".join(str(b) for b in byte_bits), 2)
            bytes_out.append(byte_val)

        try:
            return bytes(bytes_out).decode("utf-8", errors="ignore")
        except Exception:
            return ""

    # ---------- API used by your benchmark ----------

    def encode(self, img_pil: Image.Image, msg: str) -> Image.Image:
        img = self.to_tensor(img_pil.convert("RGB"))  # [3,H,W], 0..1
        img = img.unsqueeze(0).to(self.device)  # [1,3,H,W]

        msg_bits = (
            self._string_to_bits(msg).unsqueeze(0).to(self.device)
        )  # [1, message_length]

        with torch.no_grad():
            encoded_images = self.network.encoder_decoder.module.encoder(img, msg_bits)
            watermarked = img + (encoded_images - img) * self.strength_factor
            out = watermarked

        out = out.clamp(0.0, 1.0).squeeze(0).cpu()
        wm_pil = self.to_pil(out)
        return wm_pil

    def decode(self, img_pil: Image.Image) -> str:
        img = self.to_tensor(img_pil.convert("RGB"))
        img = img.unsqueeze(0).to(self.device)

        with torch.no_grad():
            decoded_messages = self.network.encoder_decoder.module.decoder(img)
            decoded_bits = decoded_messages.squeeze(0)

        decoded_str = self._bits_to_string(decoded_bits)
        return decoded_str


class Method_RAW(MethodBase):
    def __init__(self):
        self.device = "mps" if torch.cuda.is_available() else "cpu"
        self.RAW = raw.RAWatermark(device=self.device, wm_index=0)

    def encode(self, img_pil, msg):
        img = to_tensor(img_pil).unsqueeze(0).to(self.device)
        wm_image = self.RAW.encode_img(img)
        return to_pil_image(wm_image.squeeze(0).clamp(0, 1).cpu())

    def decode(self, img_pil):
        msg = self.RAW.detect_img(img_pil, decision_thres=0.5, prob=True)
        return msg


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

    def attack_jpeg(self, img, quality=50):
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


def run_benchmark(n_samples=1, attack=True, verbose=True):
    print(f"Loading W-Bench (Subset: {n_samples})...")
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)

    attacker = Attacker()

    methods = {
        # "InvisibleWM (DWT-DCT-SVD)": Method_DWTDCTSVD(),
        # "LBS": Method_LSB(),
        "MBRS": Method_MBRS(),
        "InvisibleWM (DWT-DCT)": Method_DWTDCT(),
        "RAW": Method_RAW(),
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
                attacked = attacker.attack_jpeg(watermarked, 40)
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
    run_benchmark(n_samples=500, attack=True)
