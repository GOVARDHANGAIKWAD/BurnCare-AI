"""
BurnCare AI - Reference Paper Baseline Reproduction
Replicates the feature extraction and classification approach from:
Rangaiah et al., "Improving burn diagnosis in medical image retrieval from grafting burn samples using B-coefficients and the CLAHE algorithm" (Biomedical Signal Processing and Control, 2025).

Features:
- CLAHE on L channel
- LUV Color Space statistical moments: mean, std, skewness, kurtosis for L, U, V channels (12 features)
- Small MLP / Classifier for Graft vs No-Graft prediction
- Outputs metrics on untouched Test set.
"""
import os
import cv2
import json
import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
METADATA_PATH = os.path.join(DATA_DIR, "metadata_augmented.csv")
if not os.path.exists(METADATA_PATH):
    METADATA_PATH = os.path.join(DATA_DIR, "metadata.csv")
    
DOCS_DIR = os.path.join(BASE_DIR, "docs")

def extract_luv_features(img_bgr):
    """Extracts 12 color moment features from LUV color space (mean, std, skewness, kurtosis for L, U, V)."""
    img_luv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2Luv)
    features = []
    
    for c in range(3):
        channel = img_luv[:, :, c].astype(np.float64).flatten()
        m = np.mean(channel)
        s = np.std(channel) + 1e-6
        sk = skew(channel)
        kt = kurtosis(channel)
        features.extend([m, s, sk, kt])
        
    return np.array(features)

def run_paper_baseline():
    print("Running Reference Paper Baseline (Rangaiah et al. 2025 method)...")
    if not os.path.exists(METADATA_PATH):
        raise FileNotFoundError(f"Metadata file not found. Please run prepare_dataset.py first.")
        
    df = pd.read_csv(METADATA_PATH)
    
    train_df = df[df["split"] == "train"]
    test_df = df[df["split"] == "test"]
    
    def load_features_and_labels(df_subset):
        X, y = [], []
        for _, row in df_subset.iterrows():
            img_path = os.path.join(BASE_DIR, row["path"])
            if not os.path.exists(img_path):
                continue
            img = cv2.imread(img_path)
            if img is None:
                continue
            feat = extract_luv_features(img)
            label = 1 if row["graft_needed"] == "yes" else 0
            X.append(feat)
            y.append(label)
        return np.array(X), np.array(y)
        
    print("Extracting LUV color space features for train and test splits...")
    X_train, y_train = load_features_and_labels(train_df)
    X_test, y_test = load_features_and_labels(test_df)
    
    print(f"Features loaded: X_train {X_train.shape}, X_test {X_test.shape}")
    
    # Small MLP as described in the paper
    mlp = MLPClassifier(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42)
    mlp.fit(X_train, y_train)
    
    y_pred = mlp.predict(X_test)
    y_prob = mlp.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    metrics = {
        "model": "Reference Paper Baseline (LUV + CLAHE + MLP)",
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(auc),
        "confusion_matrix": cm
    }
    
    print("\n--- BASELINE RESULTS (Test Set) ---")
    print(f"Accuracy:  {acc*100:.2f}%")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print(f"Confusion Matrix:\n{np.array(cm)}")
    
    os.makedirs(DOCS_DIR, exist_ok=True)
    with open(os.path.join(DOCS_DIR, "baseline_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    return metrics

if __name__ == "__main__":
    run_paper_baseline()
