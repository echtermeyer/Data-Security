"""
Test script for the unified Attacker class.
Demonstrates usage of various attack methods.
"""

from PIL import Image
import numpy as np
import sys
sys.path.insert(0, '/Users/david/Documents/School/Master/Semester 3/Data Security/Data-Security/benchmark/vendor/vine')
from w_bench_utils import Attacker


def create_test_image(size=(512, 512)):
    """Create a simple test image."""
    # Create a gradient image for testing
    arr = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    for i in range(size[1]):
        for j in range(size[0]):
            arr[i, j] = [int(255 * i / size[1]), int(255 * j / size[0]), 128]
    return Image.fromarray(arr)


def test_distortion_attacks():
    """Test distortion attacks."""
    print("\n=== Testing Distortion Attacks ===")
    
    attacker = Attacker(device='cpu')  # Use CPU for basic tests
    test_img = create_test_image()
    
    # Test brightness
    print("Testing brightness attack...")
    bright_img = attacker.attack_brightness(test_img, factor=1.5)
    assert bright_img.size == test_img.size
    print("✓ Brightness attack works")
    
    # Test contrast
    print("Testing contrast attack...")
    contrast_img = attacker.attack_contrast(test_img, factor=1.8)
    assert contrast_img.size == test_img.size
    print("✓ Contrast attack works")
    
    # Test blur
    print("Testing blur attack...")
    blur_img = attacker.attack_blur(test_img, kernel_size=5)
    assert blur_img.size == test_img.size
    print("✓ Blur attack works")
    
    # Test noise
    print("Testing noise attack...")
    noise_img = attacker.attack_noise(test_img, std=0.05, seed=42)
    assert noise_img.size == test_img.size
    print("✓ Noise attack works")
    
    # Test JPEG compression
    print("Testing JPEG compression attack...")
    jpeg_img = attacker.attack_jpeg(test_img, quality=50)
    assert jpeg_img.size == test_img.size
    print("✓ JPEG attack works")
    
    print("\nAll distortion attacks passed! ✓")


def test_geometric_attacks():
    """Test geometric attacks."""
    print("\n=== Testing Geometric Attacks ===")
    
    attacker = Attacker(device='cpu')
    test_img = create_test_image()
    
    # Test rotate
    print("Testing rotate attack...")
    rotated_img = attacker.attack_rotate(test_img, degree=30)
    print("✓ Rotate attack works")
    
    # Test scale
    print("Testing scale attack...")
    scaled_img = attacker.attack_scale(test_img, scale=0.5)
    assert scaled_img.size == (256, 256)
    print("✓ Scale attack works")
    
    # Test crop
    print("Testing crop attack...")
    cropped_img = attacker.attack_crop(test_img, crop_size=0.5)
    assert cropped_img.size == (256, 256)
    print("✓ Crop attack works")
    
    print("\nAll geometric attacks passed! ✓")


def test_batch_distortion():
    """Test batch distortion (w_bench_utils compatible API)."""
    print("\n=== Testing Batch Distortion ===")
    
    attacker = Attacker(device='cpu')
    test_images = [create_test_image() for _ in range(3)]
    
    # Test brightness on batch
    print("Testing batch brightness...")
    results = attacker.apply_distortion(
        test_images,
        distortion_type='brightness',
        strength=0.5,  # Relative strength (0-1)
        relative_strength=True,
        same_operation=True
    )
    assert len(results) == 3
    print("✓ Batch brightness works")
    
    # Test noise on batch
    print("Testing batch noise...")
    results = attacker.apply_distortion(
        test_images,
        distortion_type='noise',
        strength=0.5,
        relative_strength=True,
        same_operation=False  # Different random seed for each
    )
    assert len(results) == 3
    print("✓ Batch noise works")
    
    print("\nBatch distortion tests passed! ✓")


def test_get_available_attacks():
    """Test the get_available_attacks utility."""
    print("\n=== Available Attack Methods ===")
    
    attacks = Attacker.get_available_attacks()
    
    for category, methods in attacks.items():
        print(f"\n{category.upper()}:")
        for method in methods:
            print(f"  - {method}")
    
    print("\n✓ Found", sum(len(v) for v in attacks.values()), "attack methods")


if __name__ == '__main__':
    print("="*60)
    print("Attacker Class Test Suite")
    print("="*60)
    
    try:
        # Test basic attacks that don't require heavy models
        test_distortion_attacks()
        test_geometric_attacks()
        test_batch_distortion()
        test_get_available_attacks()
        
        print("\n" + "="*60)
        print("ALL TESTS PASSED! ✓")
        print("="*60)
        
        print("\nNote: Advanced attacks (diffusion, editing) require:")
        print("  - diffusers library")
        print("  - Model downloads (several GB)")
        print("  - GPU with sufficient VRAM")
        print("\nUse attacker.attack_diffusion(), attack_local_edit_*, etc.")
        print("when you have the necessary dependencies installed.")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
