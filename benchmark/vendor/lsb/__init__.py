from vendor import MethodBase
from PIL import Image
import numpy as np


class Method_LSB(MethodBase):
    def encode(self, img_pil, msg):
        img = np.array(img_pil)
        msg += "\x00"  # Add terminator
        bin_msg = "".join(format(ord(i), "08b") for i in msg)
        flat = img.flatten()

        if len(bin_msg) > len(flat):
            raise ValueError("Msg too long")

        for i, bit in enumerate(bin_msg):
            flat[i] = (flat[i] & 0xFE) | int(bit)

        return Image.fromarray(flat.reshape(img.shape))

    def decode(self, img_pil):
        img = np.array(img_pil).flatten()
        # Read enough bits (e.g. max 1000 chars) or whole image
        bits = [str(x & 1) for x in img[:8000]]

        chars = []
        for i in range(0, len(bits), 8):
            byte = "".join(bits[i : i + 8])
            if len(byte) < 8:
                break
            char = chr(int(byte, 2))
            if char == "\x00":
                break  # Stop decoding at terminator
            chars.append(char)

        return "".join(chars)


class Method_LSB_Robust(MethodBase):
    def __init__(self, redundancy=32):
        self.R = redundancy  # Pixels per bit (higher = more robust, less capacity)

    def encode(self, img_pil, msg):
        img = np.array(img_pil)
        msg += "\x00"
        bin_msg = "".join(format(ord(i), "08b") for i in msg)
        flat = img.flatten()

        if len(bin_msg) * self.R > len(flat):
            raise ValueError("Msg too long for this redundancy level")

        for i, bit in enumerate(bin_msg):
            # Write same bit to R consecutive pixels
            start = i * self.R
            val = int(bit)
            # Vectorized assignment for speed
            flat[start : start + self.R] = (flat[start : start + self.R] & 0xFE) | val

        return Image.fromarray(flat.reshape(img.shape))

    def decode(self, img_pil):
        img = np.array(img_pil).flatten()
        # Scan limit: 1000 chars * 8 bits * Redundancy
        scan_limit = 1000 * 8 * self.R
        subset = img[:scan_limit]

        chars = []
        # Step through image in chunks of size R
        for i in range(0, len(subset), self.R):
            block = subset[i : i + self.R]
            if len(block) < self.R:
                break

            # Majority Vote: sum LSBs. If sum > R/2, bit is 1
            vote_sum = np.sum(block & 1)
            bit = "1" if vote_sum > (self.R // 2) else "0"

            # Accumulate bits into chars
            if len(chars) * 8 <= i // self.R:
                # Logic to build string from bits on the fly is messy in loop
                # Easier to collect all bits first, then parse
                pass

        # Cleaner decode logic:
        # 1. Extract all bits via majority vote
        all_bits = []
        for i in range(0, len(subset), self.R):
            block = subset[i : i + self.R]
            if len(block) < self.R:
                break
            vote = np.sum(block & 1)
            all_bits.append("1" if vote > (self.R // 2) else "0")

        # 2. Convert bits to chars
        msg = ""
        for i in range(0, len(all_bits), 8):
            byte = "".join(all_bits[i : i + 8])
            if len(byte) < 8:
                break
            char = chr(int(byte, 2))
            if char == "\x00":
                break
            msg += char

        return msg
