# Benchmarking ReadMe

get started 
`pip install torch torchvision diffusers transformers accelerate invisible-watermark datasets numpy opencv-python`

How to use this for the Deep Methods

1. Clone the repos for StegaStamp/MBRS/RAW into your project folder.

2. Download their pre-trained models (.pth files).

3. Uncomment the Method_Deep_Template class.

4. Inside __init__, load their model: self.net = StegaStampEncoder(...).

5. Inside encode, call their function: out = self.net(img_tensor).

6. Inside decode, call their detector.