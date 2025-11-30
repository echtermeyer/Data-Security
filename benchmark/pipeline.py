import torch
from PIL import Image
from datasets import load_dataset
from diffusers import AutoPipelineForImage2Image
from torchvision import transforms
import matplotlib.pyplot as plt


from vendor.mbrs import Method_MBRS
from vendor.raw import Method_RAW
from vendor.dwtdct import Method_DWTDCT, Method_DWTDCTSVD
from vendor.lsb import Method_LSB



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


def run_config(n_samples=1, msg, attacks: list[tuple], verbose=True):
    print(f"Loading W-Bench (Subset: {n_samples})...")
    dataset = load_dataset("Shilin-LU/W-Bench", split="train", streaming=True)


    methods = {
        "InvisibleWM (DWT-DCT-SVD)": Method_DWTDCTSVD(msg),
        "LBS": Method_LSB(),
        "MBRS": Method_MBRS(DEVICE),
        "InvisibleWM (DWT-DCT)": Method_DWTDCT(msg),
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
            try:
                watermarked = method.encode(original, msg)
            except Exception as e:
                print(f"{m_name:<30} | {'EmbedError':<15} | {e} | False")
                continue
            attacked = watermarked
            if attacks:
                for attack, kwargs in attacks:
                
                    attacked = attack(attacked, **kwargs)
            decoded_msg = method.decode(attacked)
            if isinstance(decoded_msg, bytes):
                decoded_msg = decoded_msg.decode("utf-8", errors="ignore")

            # TODO: get success rate (e.g. fuzzy matching)
            success = msg in str(decoded_msg)

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

def run_benchmark():
    DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
    W_BENCH_SUBSET_SIZE = 5  # Keep small for M3 testing
    SECRET_MSG = "Test1234"  # 64-bit equivalent usually required

    attacker = Attacker()

    attacks = [
        [(attacker.attack_jpeg, {"quality": 10})],
        [(attacker.attack_jpeg, {"quality": 20})],
        [(attacker.attack_jpeg, {"quality": 30})],
        [(attacker.attack_jpeg, {"quality": 40})],
        [(attacker.attack_jpeg, {"quality": 50})], 
        [(attacker.attack_jpeg, {"quality": 60})],
        [(attacker.attack_jpeg, {"quality": 70})],
        [(attacker.attack_jpeg, {"quality": 80})],
        [(attacker.attack_jpeg, {"quality": 90})],
    ]
    messages = [
        "Hey", # len 3
        "Carlos",  # len 6
        "CanYouSeeMee", # len 12
        "DataScienceIsSuperCool!?", # len 24
        "MyGreenSockHasAHoleAndNowMyToeIsFreezingTerribly", # len 48
    ]
    
    for msg in messages:
        print(f"\n=== Benchmarking with message: '{msg}' ===\n")
        for attack in attacks:
            run_config(
                n_samples=W_BENCH_SUBSET_SIZE,
                msg=msg,
                attacks=attack,
                verbose=False,
            )

if __name__ == "__main__":
    run_benchmark()
    
