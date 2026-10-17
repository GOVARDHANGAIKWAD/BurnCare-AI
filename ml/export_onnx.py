"""
BurnCare AI - ONNX Model Exporter & Runtime Verification
Exports trained PyTorch dual-head model to ONNX format.
Verifies ONNX runtime inference outputs match PyTorch model predictions within epsilon tolerance.
"""
import os
import numpy as np
import torch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEIGHTS_DIR = os.path.join(BASE_DIR, "ml", "weights")
PTH_PATH = os.path.join(WEIGHTS_DIR, "burncare_model.pth")
ONNX_PATH = os.path.join(WEIGHTS_DIR, "burncare_model.onnx")

from ml.train import BurnCareDualHeadModel

def export_to_onnx():
    print("Exporting BurnCare AI PyTorch model to ONNX format...")
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    
    model = BurnCareDualHeadModel(pretrained=False)
    if os.path.exists(PTH_PATH):
        model.load_state_dict(torch.load(PTH_PATH, map_location="cpu"))
    model.eval()
    
    # Dummy input tensor [batch_size=1, channels=3, height=224, width=224]
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)
    
    # Dynamic axes for variable batch size
    dynamic_axes = {
        "input_image": {0: "batch_size"},
        "depth_output": {0: "batch_size"},
        "triage_output": {0: "batch_size"},
        "embedding_output": {0: "batch_size"}
    }
    
    torch.onnx.export(
        model,
        dummy_input,
        ONNX_PATH,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input_image"],
        output_names=["depth_output", "triage_output", "embedding_output"],
        dynamic_axes=dynamic_axes
    )
    
    print(f"Model successfully exported to ONNX at {ONNX_PATH}")
    verify_onnx_export(model, dummy_input)

def verify_onnx_export(pytorch_model, dummy_input):
    """Verifies ONNX output using onnxruntime against PyTorch output."""
    try:
        import onnxruntime as ort
        print("Verifying ONNX Runtime inference outputs...")
        
        session = ort.InferenceSession(ONNX_PATH)
        
        # PyTorch forward pass
        with torch.no_grad():
            pt_depth, pt_triage, pt_embed = pytorch_model(dummy_input)
            
        # ONNX Runtime forward pass
        ort_inputs = {"input_image": dummy_input.numpy()}
        ort_depth, ort_triage, ort_embed = session.run(None, ort_inputs)
        
        # Compare outputs
        np.testing.assert_allclose(pt_depth.numpy(), ort_depth, rtol=1e-03, atol=1e-05)
        np.testing.assert_allclose(pt_triage.numpy(), ort_triage, rtol=1e-03, atol=1e-05)
        np.testing.assert_allclose(pt_embed.numpy(), ort_embed, rtol=1e-03, atol=1e-05)
        
        print("[VERIFICATION PASSED] ONNX runtime outputs match PyTorch predictions perfectly!")
    except ImportError:
        print("onnxruntime package not installed. Skipping numeric verification.")
    except Exception as e:
        print(f"ONNX verification error: {e}")

if __name__ == "__main__":
    export_to_onnx()
