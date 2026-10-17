"""
BurnCare AI - Similar Case Vector Embedding Indexer
Extracts 256-dimensional penultimate layer feature embeddings for all processed images.
Stores embeddings in numpy array and metadata in JSON format for cosine similarity retrieval.
"""
import os
import json
import numpy as np
import pandas as pd
from PIL import Image

import torch
from torchvision import transforms

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
METADATA_PATH = os.path.join(DATA_DIR, "metadata_augmented.csv")
if not os.path.exists(METADATA_PATH):
    METADATA_PATH = os.path.join(DATA_DIR, "metadata.csv")

INDEX_DIR = os.path.join(BASE_DIR, "ml", "index")
EMBEDDINGS_NPY = os.path.join(INDEX_DIR, "embeddings.npy")
EMBEDDINGS_META = os.path.join(INDEX_DIR, "embeddings_meta.json")

WEIGHTS_PATH = os.path.join(BASE_DIR, "ml", "weights", "burncare_model.pth")
from ml.train import BurnCareDualHeadModel

def generate_embeddings_index():
    print("Generating vector embedding index for similar case retrieval...")
    os.makedirs(INDEX_DIR, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if not os.path.exists(METADATA_PATH):
        print("Metadata not found. Cannot build embeddings index.")
        return
        
    df = pd.read_csv(METADATA_PATH)
    # Only index train and val images for retrieval database
    ref_df = df[df["split"].isin(["train", "val"])].reset_index(drop=True)
    
    model = BurnCareDualHeadModel(pretrained=False).to(device)
    if os.path.exists(WEIGHTS_PATH):
        model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
    model.eval()
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    embeddings = []
    metadata_list = []
    
    with torch.no_grad():
        for _, row in ref_df.iterrows():
            img_path = os.path.join(BASE_DIR, row["path"])
            if not os.path.exists(img_path):
                continue
            try:
                img = Image.open(img_path).convert("RGB")
                tensor_img = transform(img).unsqueeze(0).to(device)
                _, _, embeds = model(tensor_img)
                emb_vec = embeds.cpu().numpy()[0]
                
                # Normalize vector to unit length for cosine similarity (dot product)
                norm = np.linalg.norm(emb_vec)
                if norm > 0:
                    emb_vec = emb_vec / norm
                    
                embeddings.append(emb_vec)
                metadata_list.append({
                    "image_id": row["image_id"],
                    "filename": row["filename"],
                    "path": row["path"],
                    "depth_label": row["depth_label"],
                    "triage_label": row["triage_label"],
                    "graft_needed": row["graft_needed"]
                })
            except Exception as e:
                continue
                
    if len(embeddings) > 0:
        embeddings_matrix = np.array(embeddings, dtype=np.float32)
        np.save(EMBEDDINGS_NPY, embeddings_matrix)
        with open(EMBEDDINGS_META, "w") as f:
            json.dump(metadata_list, f, indent=2)
            
        print(f"Embedding index successfully saved! Matrix shape: {embeddings_matrix.shape}")
        print(f"Saved to {EMBEDDINGS_NPY} and {EMBEDDINGS_META}")
    else:
        print("No embeddings extracted.")

def find_similar_cases(query_embedding, top_k=5):
    """Finds top_k similar past cases given a 256-d query embedding vector."""
    if not os.path.exists(EMBEDDINGS_NPY) or not os.path.exists(EMBEDDINGS_META):
        return []
        
    embeddings_matrix = np.load(EMBEDDINGS_NPY)
    with open(EMBEDDINGS_META, "r") as f:
        meta_list = json.load(f)
        
    # Ensure query vector is unit normalized
    norm = np.linalg.norm(query_embedding)
    if norm > 0:
        query_embedding = query_embedding / norm
        
    # Cosine similarities = dot product
    similarities = np.dot(embeddings_matrix, query_embedding)
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        case = meta_list[idx].copy()
        case["similarity_score"] = float(similarities[idx])
        results.append(case)
        
    return results

if __name__ == "__main__":
    generate_embeddings_index()
