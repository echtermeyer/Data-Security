import os
import numpy as np
import tensorflow as tf
from PIL import Image

# --- CRITICAL FOR M3 MAC / TF 2.x ---
# StegaStamp is old TF 1.x code. We must disable v2 behavior immediately.
tf.compat.v1.disable_eager_execution()
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)


class StegaStampTFWrapper:
    def __init__(self, model_dir, height=400, width=400, secret_size=100):
        """
        Args:
            model_dir (str): Path to folder containing 'saved_model.pb'
            height (int): Input image height (default 400 for StegaStamp)
            width (int): Input image width (default 400 for StegaStamp)
            secret_size (int): Bit length of secret (default 100)
        """
        self.H = height
        self.W = width
        self.S = secret_size
        self.sess = tf.compat.v1.Session(graph=tf.Graph())

        print(f"Loading TensorFlow SavedModel from: {model_dir}")

        with self.sess.graph.as_default():
            # Load the SavedModel (Architecture + Weights)
            tf.compat.v1.saved_model.loader.load(
                self.sess, [tf.compat.v1.saved_model.tag_constants.SERVING], model_dir
            )

            # --- MAP TENSORS ---
            # These names are standard for the Tancik/StegaStamp SavedModel export.
            # If you get a KeyError, we may need to inspect the graph names.
            graph = self.sess.graph

            # Encoder Tensors
            self.input_secret = graph.get_tensor_by_name("secret:0")
            self.input_image = graph.get_tensor_by_name("image:0")
            self.output_steg = graph.get_tensor_by_name("steganographic_image:0")

            # Decoder Tensors
            # (Sometimes the input tensor is shared as 'image:0', sometimes separate)
            self.output_decoded = graph.get_tensor_by_name("decoded_secret:0")

    def encode(self, image_pil, secret_string):
        """
        Embeds a string into the image.
        Returns: PIL Image
        """
        # 1. Preprocess Image (Resize -> Normalize -> Add Batch Dim)
        img = image_pil.convert("RGB").resize((self.W, self.H))
        img_np = np.array(img, dtype=np.float32) / 255.0
        img_batch = np.expand_dims(img_np, axis=0)  # Shape: (1, 400, 400, 3)

        # 2. Preprocess Secret (String -> Bits)
        secret_bits = self._str_to_bits(secret_string, self.S)

        # 3. Run Inference
        steg_np = self.sess.run(
            self.output_steg,
            feed_dict={self.input_image: img_batch, self.input_secret: secret_bits},
        )

        # 4. Postprocess (Batch Dim -> Denormalize -> uint8 -> PIL)
        steg_img_np = np.clip(steg_np[0], 0, 1) * 255.0
        return Image.fromarray(steg_img_np.astype(np.uint8))

    def decode(self, image_pil):
        """
        Extracts string from image.
        Returns: String
        """
        # 1. Preprocess
        img = image_pil.convert("RGB").resize((self.W, self.H))
        img_np = np.array(img, dtype=np.float32) / 255.0
        img_batch = np.expand_dims(img_np, axis=0)

        # 2. Run Inference
        # Note: We pass 0s for secret if the graph requires it,
        # but usually decoder only needs image.
        decoded_bits = self.sess.run(
            self.output_decoded, feed_dict={self.input_image: img_batch}
        )

        # 3. Postprocess (Bits -> String)
        # StegaStamp output is usually raw probabilities or bits.
        # If probabilities (floats), round them.
        bits = (decoded_bits[0] > 0.5).astype(int)
        return self._bits_to_str(bits)

    # --- Utilities ---
    def _str_to_bits(self, s, N):
        bits = []
        for char in s:
            bin_val = bin(ord(char))[2:].zfill(8)
            bits.extend([int(b) for b in bin_val])
        if len(bits) < N:
            bits += [0] * (N - len(bits))
        else:
            bits = bits[:N]
        return np.array([bits], dtype=np.float32)  # Batch dimension (1, 100)

    def _bits_to_str(self, bits):
        chars = []
        for i in range(0, len(bits), 8):
            byte = bits[i : i + 8]
            if len(byte) < 8:
                break
            byte_str = "".join(str(b) for b in byte)
            if byte_str == "00000000":
                break
            chars.append(chr(int(byte_str, 2)))
        return "".join(chars)
