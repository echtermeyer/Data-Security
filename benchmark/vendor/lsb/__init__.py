from vendor import MethodBase
from PIL import Image
import numpy as np


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
