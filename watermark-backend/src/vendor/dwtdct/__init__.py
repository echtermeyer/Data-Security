from vendor import MethodBase
from imwatermark import WatermarkEncoder, WatermarkDecoder
import cv2
from PIL import Image
import numpy as np


class Method_DWTDCT(MethodBase):
    def __init__(self, msg):
        self.enc = WatermarkEncoder()
        self.bits_len = 8 * len(msg)
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
    def __init__(self, msg):
        # Encoder/decoder from invisible-watermark (imwatermark)
        self.enc = WatermarkEncoder()
        self.bits_len = 8 * len(msg)
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
