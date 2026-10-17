"""
BurnCare AI - Deep Transfer Learning Dual-Head PyTorch Model Training
Trains a dual-head CNN/ViT architecture (ResNet18 / EfficientNet backbone):
- Head 1: Depth Classification (3 classes: superficial, partial_thickness, full_thickness)
- Head 2: Triage Classification (2 classes: primary, emergency)

Includes: AdamW, Cosine Annealing, Label Smoothing, Mixed Precision (AMP), Seed control.
Saves model weights to ml/weights/burncare_model.pth.
"""
import os
import json
import random
import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

# Seed control for reproducibility
def seed_everything(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

seed_everything(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
METADATA_PATH = os.path.join(DATA_DIR, "metadata_augmented.csv")
if not os.path.exists(METADATA_PATH):
    METADATA_PATH = os.path.join(DATA_DIR, "metadata.csv")

WEIGHTS_DIR = os.path.join(BASE_DIR, "ml", "weights")

DEPTH_MAP = {"superficial": 0, "partial_thickness": 1, "full_thickness": 2}
TRIAGE_MAP = {"primary": 0, "emergency": 1}

class BurnDataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(BASE_DIR, row["path"])
        
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
            
        depth_target = DEPTH_MAP[row["depth_label"]]
        triage_target = TRIAGE_MAP[row["triage_label"]]
        
        return image, torch.tensor(depth_target, dtype=torch.long), torch.tensor(triage_target, dtype=torch.long), row["image_id"]

class BurnCareDualHeadModel(nn.Module):
    def __init__(self, pretrained=True):
        super(BurnCareDualHeadModel, self).__init__()
        # Use ResNet18 backbone
        self.backbone = models.resnet18(weights=models.ResNet18_Weights.DEFAULT if pretrained else None)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity() # Remove default fc layer
        
        self.shared_feature_extractor = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        
        # Head 1: Depth (3 classes)
        self.depth_head = nn.Linear(256, 3)
        # Head 2: Triage (2 classes)
        self.triage_head = nn.Linear(256, 2)

    def forward(self, x):
        features = self.backbone(x)
        embeds = self.shared_feature_extractor(features)
        depth_logits = self.depth_head(embeds)
        triage_logits = self.triage_head(embeds)
        return depth_logits, triage_logits, embeds

def train_model(epochs=12, batch_size=32, lr=1e-3):
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training BurnCare AI model on device: {device}")
    
    df = pd.read_csv(METADATA_PATH)
    train_df = df[df["split"] == "train"]
    val_df = df[df["split"] == "val"]
    
    # Image transformations
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = BurnDataset(train_df, transform=train_transform)
    val_dataset = BurnDataset(val_df, transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    model = BurnCareDualHeadModel(pretrained=True).to(device)
    
    criterion_depth = nn.CrossEntropyLoss(label_smoothing=0.1)
    criterion_triage = nn.CrossEntropyLoss(label_smoothing=0.1)
    
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())
    
    best_val_loss = float("inf")
    best_weights_path = os.path.join(WEIGHTS_DIR, "burncare_model.pth")
    
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        
        for images, depth_targets, triage_targets, _ in train_loader:
            images = images.to(device)
            depth_targets = depth_targets.to(device)
            triage_targets = triage_targets.to(device)
            
            optimizer.zero_grad()
            
            with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                depth_logits, triage_logits, _ = model(images)
                loss_d = criterion_depth(depth_logits, depth_targets)
                loss_t = criterion_triage(triage_logits, triage_targets)
                loss = loss_d + loss_t
                
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
            train_loss += loss.item() * images.size(0)
            
        scheduler.step()
        train_loss /= len(train_dataset)
        
        # Validation
        model.eval()
        val_loss = 0.0
        correct_depth = 0
        correct_triage = 0
        total = 0
        
        with torch.no_grad():
            for images, depth_targets, triage_targets, _ in val_loader:
                images = images.to(device)
                depth_targets = depth_targets.to(device)
                triage_targets = triage_targets.to(device)
                
                depth_logits, triage_logits, _ = model(images)
                loss_d = criterion_depth(depth_logits, depth_targets)
                loss_t = criterion_triage(triage_logits, triage_targets)
                loss = loss_d + loss_t
                
                val_loss += loss.item() * images.size(0)
                
                _, pred_d = torch.max(depth_logits, 1)
                _, pred_t = torch.max(triage_logits, 1)
                
                correct_depth += (pred_d == depth_targets).sum().item()
                correct_triage += (pred_t == triage_targets).sum().item()
                total += images.size(0)
                
        val_loss /= len(val_dataset)
        acc_d = correct_depth / total
        acc_t = correct_triage / total
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Depth Acc: {acc_d*100:.2f}% | Triage Acc: {acc_t*100:.2f}%")
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), best_weights_path)
            
    print(f"\nTraining complete! Saved best model weights to {best_weights_path}")

if __name__ == "__main__":
    train_model(epochs=8)
