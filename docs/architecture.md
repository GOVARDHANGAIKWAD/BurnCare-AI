# BurnCare AI - System Architecture

```
[React + Vite + Tailwind Dashboard] --HTTPS/REST--> [FastAPI Backend Engine] --> [PyTorch / ONNX ML Model]
         |                                                 |                            |
   Leaflet Maps API                                  SQLite Database            CLAHE + Grad-CAM Explainer
         |                                                 |                            |
  OSM Overpass API                                    PDF Report Generator       Cosine Similarity Retrieval
```

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React-Leaflet.
- **Backend API**: Python FastAPI, SQLAlchemy ORM, SQLite/PostgreSQL, ReportLab (PDF), PyJWT, bcrypt.
- **ML & Data Pipeline**: PyTorch, Torchvision, OpenCV (CLAHE), Albumentations, ImageHash (Perceptual Deduplication), Scikit-Learn, ONNX Runtime.
- **Geographic Services**: Haversine distance calculator, OpenStreetMap Overpass API integration.

## Key Safety Architecture: Escalate-Only Rule Engine
The clinical decision engine combines ML neural network outputs with a deterministic rule-based safety net.
**Enforcement Guarantee**: The rule engine CAN ONLY ESCALATE a primary prediction to EMERGENCY. It NEVER downgrades an emergency triage prediction.
