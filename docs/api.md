# BurnCare AI - REST API Specifications

## Authentication Endpoints
- `POST /api/auth/register`: Register user account with email & password.
- `POST /api/auth/login`: Authenticate and receive JWT Bearer token.
- `GET /api/auth/me`: Get current authenticated user profile.

## Triage & Analysis Endpoints
- `POST /api/analyze`: Multipart form upload (image file <8MB + optional clinical questionnaire JSON). Runs CLAHE preprocessing, PyTorch/ONNX inference, Grad-CAM heatmap overlay, escalate-only rule engine, vector similarity retrieval, and saves analysis record.
- `GET /api/analyses`: Retrieve scan history list.
- `GET /api/analyses/{id}`: Retrieve single scan analysis record.
- `GET /api/analyses/{id}/report`: Download medical PDF report generated via ReportLab.

## Medical Care & Guidance Endpoints
- `GET /api/firstaid?severity=primary|emergency`: Returns step-by-step first-aid guidance timeline with step durations, warnings, and Do's & Don'ts cards.
- `GET /api/hospitals/nearby?lat=&lng=&radius_km=`: Queries local database and falls back to OpenStreetMap Overpass API; sorts hospitals by Haversine distance and flags specialized Burn Units.
- `GET /api/doctors?city=&specialty=`: Search plastic surgeons and burn specialists by city or specialty.
- `GET /api/similar/{id}`: Retrieves top-5 vector embedding similar past cases.
