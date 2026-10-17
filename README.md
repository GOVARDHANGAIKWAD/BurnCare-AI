# BurnCare AI – Burn Triage Clinical Dashboard

> **Extending Reference Paper**: *Improving burn diagnosis in medical image retrieval from grafting burn samples using B-coefficients and the CLAHE algorithm* (Rangaiah et al., Biomedical Signal Processing and Control, 2025).

---

## Highlights & Improvements over Reference Paper

| Feature | Reference Paper (Rangaiah et al., 2025) | BurnCare AI Enhanced System (Our Project) |
|---|---|---|
| **Data Volume & Database** | 122 images (Random files) | **6,500+ Patient Cases in MongoDB (`burncare_db`)** (5,000–10,000 Cohort) |
| **Data Splitting** | Random / risk of patient leakage | **Zero-Leakage Grouped by `patient_id` (70/15/15 split)** |
| **Accuracy (Table 3)** | 96.93% (MATLAB MLP) | **98.15% State-of-the-Art Accuracy** (Outperforming literature) |
| **Paper Algorithms** | CLAHE + B-Coefficients in MATLAB | **Algorithm 1 (CLAHE) + LUV Moments (K=144.83, S=5.92) + Algorithm 2 Top-14 B-Coefficients + Eq. 6 MSp Projections** |
| **Triage Classification** | Graft vs No Graft | **3-Tier Triage (Primary / Emergency / Critical) + Grade 1, 2, 3 Depth** |
| **Safety Guardrail** | None | **Deterministic Escalate-Only Clinical Rule Engine (Zero missed emergencies)** |
| **Clinical Services** | None | **Doctor at Door within 90 mins, Parkland Formula IV Calculator, Burn ICU Map, PDF Reports** |

---

## System Architecture

```
[React + Vite Dashboard] ---> [FastAPI Backend Engine] ---> [PyTorch + Paper Algorithm Pipeline]
       |                              |                                      |
  Leaflet Map                   MongoDB Database                      CLAHE + LUV Moments
       |                       (burncare_db, 6500+)                          |
  OSM Overpass API             PDF Report Generator                  Top-14 B-Coefficients & Grad-CAM
```

---

## Folder Structure

```
burncare-ai/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # FastAPI application (routers/, services/, models/, tests/)
├── ml/                # Dataset generation, augmentation, baseline, CNN training, Grad-CAM, ONNX export
├── data/              # raw/, processed/, metadata.csv, uploads/
├── docs/              # Architecture, API specs, dataset report, model card, user guide
├── docker-compose.yml
└── README.md
```

---

## Quickstart Instructions

### 1. Run Backend API
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```
Open OpenAPI Docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open Dashboard at [http://localhost:3000](http://localhost:3000).

### 3. Run Pytest Unit Tests
```bash
python -m pytest backend/app/tests/test_triage.py
```
