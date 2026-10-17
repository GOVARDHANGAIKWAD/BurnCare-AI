# BurnCare AI - User & Developer Guide

## Quick Start (Local Development)

### 1. Backend API (FastAPI)
```bash
# From workspace root
python -m uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Dashboard (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be available at `http://localhost:3000`.

### 3. ML Data Pipeline Commands
```bash
# 1. Generate raw 1,500 image dataset
python ml/generate_raw_dataset.py

# 2. Prepare & split dataset by patient_id
python ml/prepare_dataset.py

# 3. Augment training split
python ml/augment.py

# 4. Run Reference Paper Baseline
python ml/baseline_paper.py

# 5. Train PyTorch Dual-Head Model
python ml/train.py

# 6. Evaluate Model on Test Set
python ml/evaluate.py

# 7. Generate Vector Embeddings Index
python ml/embeddings.py

# 8. Export Model to ONNX
python ml/export_onnx.py
```
