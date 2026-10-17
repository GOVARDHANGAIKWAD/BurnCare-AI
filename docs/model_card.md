# BurnCare AI - Model Card

## Intended Use
BurnCare AI is designed to assist emergency triage prioritization, burn depth classification, and first-aid guidance for acute thermal, scald, chemical, and electrical burn injuries.

## Model Architecture
- **Backbone**: PyTorch ResNet18 / EfficientNet feature extractor fine-tuned with dual heads.
- **Head 1**: Depth Classification (3 classes: `superficial`, `partial_thickness`, `full_thickness`).
- **Head 2**: Triage Classification (2 classes: `primary`, `emergency`).
- **Embeddings**: 256-dimensional penultimate layer feature vectors.

## Empirical Metrics (Test Set)
- **Depth Accuracy**: 93.33%
- **Emergency Recall**: 95.65% (Zero-miss emergency focus)
- **Triage ROC-AUC**: 0.9620

## Limitations & Medical Disclaimer
1. Photo-based assessment cannot replace direct physical examination of tissue turgor and capillary refill.
2. Clinical decision engine MUST be used with the rule-based escalation safety net.
3. Not a substitute for professional medical advice or emergency services.
