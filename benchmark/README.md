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
| **Deep Learning** | **StegaStamp** | Physical-robust DNN watermark | **Distortion Robustness SOTA.** The gold standard for resistance against physical attacks (print-to-camera, rotation, cropping). | 🟡 Medium (Needs working PyTorch port/MPS) | [PyTorch Port (Example)](https://github.com/conda-inc/StegaStamp-PyTorch) |
| **Deep Learning** | *(Optional) HiDDeN* | Classic encoder-decoder neural watermark | **Speed/Lightweight Baseline.** The foundational end-to-end neural watermark. Fast inference and a good deep learning lower bound. | 🟢 Low (PyTorch/MPS recommended) | [GitHub (ando-kh/HiDDeN)](https://github.com/ando-kh/HiDDeN) |

### Include MBRS

```python
# TODO: Fix * imports
from torch.utils.data import DataLoader
from utils import *
from network.Network import *

from utils.load_test_setting import *

device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")

network = Network(
    H, W, message_length, noise_layers, device, batch_size, lr, with_diffusion
)
EC_path = result_folder + "models/EC_" + str(model_epoch) + ".pth"
network.load_model_ed(EC_path, device)

encoded_images = network.encoder_decoder.module.encoder(images, messages)
encoded_images = images + (encoded_images - image) * strength_factor
noised_images = network.encoder_decoder.module.noise([encoded_images, images])

decoded_messages = network.encoder_decoder.module.decoder(noised_images)
```