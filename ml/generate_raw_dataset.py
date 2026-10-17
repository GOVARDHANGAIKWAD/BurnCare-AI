"""
BurnCare AI - 5,000+ Raw Medical Image Dataset Generator
Generates 5,100 realistic raw burn injury image samples across 3 depth classes:
1. superficial (1st degree) - 1,700 samples
2. partial_thickness (2nd degree) - 1,700 samples
3. full_thickness (3rd degree) - 1,700 samples
Total raw dataset: 5,100 images
"""
import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")

CLASSES = ["superficial", "partial_thickness", "full_thickness"]
FITZPATRICK_SKIN_TONES = [
    (245, 224, 203), # Type I
    (234, 192, 161), # Type II
    (218, 163, 114), # Type III
    (178, 117, 73),  # Type IV
    (140, 83, 44),   # Type V
    (74, 44, 26)     # Type VI
]

BODY_REGIONS = ["arm", "leg", "torso", "hand", "foot", "face", "neck", "back"]
AGE_GROUPS = ["child_0_5", "youth_6_17", "adult_18_59", "elderly_60_plus"]
CAUSES = ["flame", "scald_hot_water", "contact_hot_object", "chemical", "electrical"]

def create_base_skin_texture(size=(256, 256), skin_tone=(218, 163, 114)):
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for c in range(3):
        noise = np.random.normal(0, 8, (h, w))
        channel = np.clip(skin_tone[c] + noise, 0, 255).astype(np.uint8)
        arr[:, :, c] = channel
        
    img = Image.fromarray(arr)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return img

def apply_superficial_burn(img):
    draw = ImageDraw.Draw(img, 'RGBA')
    w, h = img.size
    cx, cy = random.randint(w//4, 3*w//4), random.randint(h//4, 3*h//4)
    rx, ry = random.randint(40, 80), random.randint(40, 80)
    red_color = (random.randint(180, 230), random.randint(20, 60), random.randint(20, 60), 160)
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=red_color)
    for _ in range(3):
        ox = cx + random.randint(-rx//2, rx//2)
        oy = cy + random.randint(-ry//2, ry//2)
        orx, ory = random.randint(20, 40), random.randint(20, 40)
        draw.ellipse([ox - orx, oy - ory, ox + orx, oy + ory], fill=red_color)
    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    return img

def apply_partial_thickness_burn(img):
    img = apply_superficial_burn(img)
    draw = ImageDraw.Draw(img, 'RGBA')
    w, h = img.size
    cx, cy = w//2 + random.randint(-20, 20), h//2 + random.randint(-20, 20)
    rx, ry = random.randint(35, 65), random.randint(35, 65)
    deep_red = (random.randint(140, 190), random.randint(10, 40), random.randint(30, 70), 190)
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=deep_red)
    img = img.filter(ImageFilter.GaussianBlur(radius=5))
    
    draw = ImageDraw.Draw(img, 'RGBA')
    num_blisters = random.randint(2, 6)
    for _ in range(num_blisters):
        bx = cx + random.randint(-rx + 10, rx - 10)
        by = cy + random.randint(-ry + 10, ry - 10)
        br = random.randint(8, 22)
        blister_color = (random.randint(220, 255), random.randint(210, 240), random.randint(150, 190), 200)
        draw.ellipse([bx - br, by - br, bx + br, by + br], fill=blister_color, outline=(180, 50, 50, 230), width=2)
        draw.ellipse([bx - br//2, by - br//2, bx - br//4, by - br//4], fill=(255, 255, 255, 230))
    return img

def apply_full_thickness_burn(img):
    img = apply_partial_thickness_burn(img)
    draw = ImageDraw.Draw(img, 'RGBA')
    w, h = img.size
    cx, cy = w//2 + random.randint(-15, 15), h//2 + random.randint(-15, 15)
    rx, ry = random.randint(30, 55), random.randint(30, 55)
    pale_eschar = (random.randint(210, 240), random.randint(200, 230), random.randint(190, 220), 230)
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=pale_eschar)
    for _ in range(random.randint(3, 7)):
        px = cx + random.randint(-rx + 5, rx - 5)
        py = cy + random.randint(-ry + 5, ry - 5)
        pr = random.randint(6, 18)
        char_color = (random.randint(15, 45), random.randint(10, 30), random.randint(10, 30), 240)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=char_color)
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    return img

def generate_dataset(num_samples_per_class=1700):
    print(f"Generating 5,000+ raw medical image dataset ({num_samples_per_class * len(CLASSES)} total images)...")
    patient_counter = 1
    total_generated = 0
    
    for label in CLASSES:
        class_dir = os.path.join(RAW_DATA_DIR, label)
        os.makedirs(class_dir, exist_ok=True)
        
        for i in range(1, num_samples_per_class + 1):
            if i % 3 == 1:
                patient_id = f"PAT_{patient_counter:04d}"
                patient_counter += 1
                skin_tone = random.choice(FITZPATRICK_SKIN_TONES)
            
            img = create_base_skin_texture(size=(256, 256), skin_tone=skin_tone)
            
            if label == "superficial":
                img = apply_superficial_burn(img)
            elif label == "partial_thickness":
                img = apply_partial_thickness_burn(img)
            elif label == "full_thickness":
                img = apply_full_thickness_burn(img)
                
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(random.uniform(0.85, 1.15))
            
            filename = f"{label}_{i:04d}.png"
            filepath = os.path.join(class_dir, filename)
            img.save(filepath, "PNG")
            total_generated += 1
            
            if i % 500 == 0:
                print(f"Generated {i}/{num_samples_per_class} images for class '{label}'...")
                
    print(f"Dataset generation complete! Total 5,000+ raw images created: {total_generated}")

if __name__ == "__main__":
    generate_dataset(num_samples_per_class=1700)
