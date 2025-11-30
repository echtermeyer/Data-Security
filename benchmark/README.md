# Benchmarking ReadMe

### Getting started 
`pip install torch torchvision diffusers transformers accelerate invisible-watermark datasets numpy opencv-python`

How to use this for the Deep Methods

1. Clone the repos for StegaStamp/MBRS/RAW into your project folder.

2. Download their pre-trained models (.pth files).

3. Uncomment the Method_Deep_Template class.

4. Inside __init__, load their model: self.net = StegaStampEncoder(...).

5. Inside encode, call their function: out = self.net(img_tensor).

6. Inside decode, call their detector.

### Methods

| Category | Method | Paper / Short Name | Relevance / Key Features | M3 Mac Feasibility | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Transform** | **DWTDCTSVD** | Classical DWT–DCT–SVD (Navas et al.) / Stability AI classical DWT–DCT–SVD | **The Industry Standard.** Highly robust against compression and spatial distortions. Essential "classical" strong baseline. | 🟢 Very High (CPU/NumPy) | [GitHub (ShieldMnt/invisible-watermark)](https://github.com/ShieldMnt/invisible-watermark) |
| **Transform** | **DWTDCT** | Classical DWT–DCT | **The Weak Transform Baseline.** Simpler, faster version of DWT-DCT-SVD. Good for demonstrating the benefit of adding SVD. | 🟢 Very High (CPU/NumPy) | [GitHub (ShieldMnt/invisible-watermark)](https://github.com/ShieldMnt/invisible-watermark) |
| **Spatial** | **LSB** | Least Significant Bit | **The "Zero Robustness" Baseline.** Simple pixel-level embedding. Serves as a control to show how easily fragile watermarks are destroyed. | 🟢 Very High (CPU/Instant) | [GitHub (stego-lsb)](https://github.com/ragibson/Steganography) |
| **Spatial** | **RAW** | RAW: Robust & Agile Watermark | **Modern Pixel-Level (Deep).** Learns a direct, zero-bit detectable pattern on the pixels. Robust to diffusion regeneration. | 🟡 Medium (PyTorch/MPS required for inference) | [GitHub (Official)](https://github.com/jeremyxianx/RAWatermark) |
| **Deep Learning** | **MBRS** | Mini-Batch of Real & Simulated JPEG | **Compression Robustness SOTA.** Trained specifically to survive heavy JPEG compression and noise attacks. | 🟢 Low-Medium (PyTorch/MPS recommended) | [GitHub (jzyustc/MBRS)](https://github.com/jzyustc/MBRS) |
| **Deep Learning** | **VINE** | Variational Inference for Non-Parametric Image Editing (VINE) | **Robustness Benchmark / Restoration.** Uses diffusion priors (SDXL VAE) to **restore** watermarks from heavily edited images. | 🟡 Medium (Requires `diffusers` VAE, feasible on MPS for inference) | [GitHub (Shilin-LU/VINE)](https://github.com/Shilin-LU/VINE) |

### Include MBRS

```python
# TODO: Fix * imports
from torch.utils.data import DataLoader
from mbrs.utils import *
from mbrs.network.Network import *

from mbrs.utils.load_test_setting import *

device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")

network = Network(
    H, W, message_length, noise_layers, device, batch_size, lr, with_diffusion
)
EC_path = result_folder + "models/EC_" + str(model_epoch) + ".pth"
network.load_model_ed(EC_path, device)

network.encoder_decoder.eval()
network.discriminator.eval()

encoded_images = network.encoder_decoder.module.encoder(images, messages)
encoded_images = images + (encoded_images - image) * strength_factor
noised_images = network.encoder_decoder.module.noise([encoded_images, images])

decoded_messages = network.encoder_decoder.module.decoder(noised_images)
```

### Include RAW

```python
import torch
from raw.scripts import raw, tools

RAW = raw.RAWatermark(device = device, wm_index = 0)

wm_image = RAW.encode_img(some_image)
RAW.detect_img(wm_image, decision_thres=0.5)
```

### Include StegaStamp

```python
from vendor.stegastamp import StegaStampTFWrapper
model_folder = "vendor/stegastamp/saved_models/stegastamp_pretrained"

stega = StegaStampTFWrapper(model_folder)
wm_img = stega.encode(img, "Some super secret message")
msg = stega.decode(wm_img)
```