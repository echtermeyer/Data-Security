import torch
from torchvision import transforms
from vendor.mbrs.network.Network import Network
from vendor import MethodBase
from PIL import Image
import json, os


class Method_MBRS(MethodBase):
    def __init__(self, device):
        # --- 1) Load config from vendor/mbrs/test_settings.json directly ---
        # Resolve path: pipeline.py is in benchmark/, so vendor/mbrs is below it
        self.device = device
        here = os.path.dirname(__file__)
        cfg_path = os.path.join(here, "test_settings.json")

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
        base_mbrs_dir = os.path.join(here, "results")
        result_folder = os.path.join(base_mbrs_dir, "MBRS_256_m256")
        model_epoch = cfg.get("model_epoch", 42)  # EC_42.pth

        self._result_folder = result_folder
        self._model_epoch = model_epoch

        # --- 2) Device & network ---  # "mps" or "cpu" from your config

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
