# BurnCare AI - Dataset & Preprocessing Documentation

## Dataset Composition
- **Raw Images**: 1,500 clinical synthetic burn injury image samples (500 superficial, 500 partial thickness, 500 full thickness).
- **Processed Images**: 1,500 images cleaned, deduplicated via perceptual hashing (`imagehash`), resized to 256x256, and enhanced using CLAHE on the L-channel of LAB color space.
- **Augmented Training Dataset**: 2,100 augmented copies generated exclusively for the training split (total 3,600 images).

## Patient-Isolated Splitting Guarantee
- **Split Ratio**: 70% Train, 15% Validation, 15% Test.
- **Grouping Rule**: Splitting is executed strictly GROUPED BY `patient_id` BEFORE any data augmentation occurs.
- **Leakage Prevention**: Guaranteed 0% patient leakage. Test and validation sets contain only real, untouched clinical images.
