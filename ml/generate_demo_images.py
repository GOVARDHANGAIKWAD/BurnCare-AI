import os
import random
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "data", "uploads")
HEATMAPS_DIR = os.path.join(BASE_DIR, "data", "heatmaps")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(HEATMAPS_DIR, exist_ok=True)

def generate_demo_burn_image(file_path: str, heatmap_path: str, seed: int):
    random.seed(seed)
    width, height = 400, 400
    
    # Base skin tone variation
    r_skin = random.randint(190, 240)
    g_skin = random.randint(140, 185)
    b_skin = random.randint(110, 155)
    img = Image.new("RGB", (width, height), (r_skin, g_skin, b_skin))
    draw = ImageDraw.Draw(img)

    # Draw skin texture / contours
    for _ in range(30):
        x = random.randint(0, width)
        y = random.randint(0, height)
        rx = random.randint(20, 80)
        ry = random.randint(20, 80)
        draw.ellipse([x-rx, y-ry, x+rx, y+ry], fill=(r_skin-15, g_skin-15, b_skin-15))

    img = img.filter(ImageFilter.GaussianBlur(15))
    draw = ImageDraw.Draw(img)

    # Burn center lesion parameters
    cx, cy = width // 2 + random.randint(-40, 40), height // 2 + random.randint(-40, 40)
    br_x = random.randint(70, 130)
    br_y = random.randint(70, 130)

    # Erythema (Redness zone)
    draw.ellipse([cx-br_x, cy-br_y, cx+br_x, cy+br_y], fill=(220, 50, 60))

    # Deep necrosis / charring or blistering center
    draw.ellipse([cx-br_x//2, cy-br_y//2, cx+br_x//2, cy+br_y//2], fill=(160, 30, 40))

    # Blister spots
    for _ in range(random.randint(3, 8)):
        bx = cx + random.randint(-br_x//2, br_x//2)
        by = cy + random.randint(-br_y//2, br_y//2)
        br = random.randint(8, 20)
        draw.ellipse([bx-br, by-br, bx+br, by+br], fill=(240, 200, 150), outline=(200, 140, 90))

    img = img.filter(ImageFilter.GaussianBlur(5))
    img.save(file_path)

    # Generate Grad-CAM Heatmap
    heatmap_img = img.copy().convert("RGBA")
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(overlay)

    # Thermal attention rings (Red -> Yellow -> Blue)
    h_draw.ellipse([cx-br_x-20, cy-br_y-20, cx+br_x+20, cy+br_y+20], fill=(0, 0, 255, 100))
    h_draw.ellipse([cx-br_x, cy-br_y, cx+br_x, cy+br_y], fill=(255, 255, 0, 160))
    h_draw.ellipse([cx-br_x//2, cy-br_y//2, cx+br_x//2, cy+br_y//2], fill=(255, 0, 0, 210))

    overlay = overlay.filter(ImageFilter.GaussianBlur(25))
    heatmap = Image.alpha_composite(heatmap_img, overlay)
    heatmap.convert("RGB").save(heatmap_path)

print("Generating 30 demo burn images & Grad-CAM heatmaps...")
for i in range(1, 31):
    img_name = f"upload_demo_{i:02d}.png"
    hm_name = f"heatmap_demo_{i:02d}.png"
    generate_demo_burn_image(
        os.path.join(UPLOADS_DIR, img_name),
        os.path.join(HEATMAPS_DIR, hm_name),
        seed=100 + i
    )

print("Successfully generated all 30 demo burn photos and Grad-CAM heatmaps!")
