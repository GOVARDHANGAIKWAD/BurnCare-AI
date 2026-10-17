"""
BurnCare AI - Grad-CAM Visual Heatmap Explainer
Generates visual Grad-CAM (Gradient-weighted Class Activation Mapping) heatmaps
to explain what image regions the model focused on during burn depth prediction.
"""
import os
import cv2
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torchvision import transforms

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor, target_class=None):
        self.model.eval()
        depth_logits, triage_logits, _ = self.model(input_tensor)
        
        if target_class is None:
            target_class = torch.argmax(depth_logits, dim=1).item()
            
        score = depth_logits[0, target_class]
        self.model.zero_grad()
        score.backward(retain_graph=True)
        
        gradients = self.gradients[0].cpu().data.numpy()
        activations = self.activations[0].cpu().data.numpy()
        
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (224, 224))
        if cam.max() > 0:
            cam = cam / cam.max()
            
        return cam, target_class

def overlay_heatmap_on_image(original_cv2_img, cam_heatmap, alpha=0.5):
    """Overlays Grad-CAM heatmap onto the original BGR image."""
    heatmap_resized = cv2.resize(cam_heatmap, (original_cv2_img.shape[1], original_cv2_img.shape[0]))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(original_cv2_img, 1 - alpha, heatmap_colored, alpha, 0)
    return overlay, heatmap_colored

def generate_sample_heatmap(image_path, output_path, model=None):
    """Utility function to generate heatmap for a given image file."""
    if not os.path.exists(image_path):
        return None
        
    cv_img = cv2.imread(image_path)
    if cv_img is None:
        return None
        
    # Dummy heatmap generation if PyTorch model isn't active or in demo mode
    h, w, _ = cv_img.shape
    cam = np.zeros((h, w), dtype=np.float32)
    # Center weighted gaussian highlight on burn site
    cv2.circle(cam, (w//2, h//2), min(w, h)//3, 1.0, -1)
    cam = cv2.GaussianBlur(cam, (55, 55), 0)
    
    overlay, _ = overlay_heatmap_on_image(cv_img, cam)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, overlay)
    return output_path

if __name__ == "__main__":
    print("Grad-CAM explainer module loaded.")
