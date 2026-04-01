import numpy as np
from PIL import Image, ImageOps
import io
import os
import json
from app.model_loader import model

# Load labels from external JSON
LABELS_PATH = os.path.join(os.path.dirname(__file__), "labels.json")
try:
    with open(LABELS_PATH, "r") as f:
        class_names = json.load(f)
except Exception as e:
    print(f"Warning: Could not load labels from {LABELS_PATH}. Falling back to default.")
    class_names = [f"Class_{i}" for i in range(15)]

def smart_resize(image, target_size=(224, 224)):
    """Resize image maintaining aspect ratio with padding (no squishing)"""
    image.thumbnail(target_size, Image.Resampling.LANCZOS)
    delta_w = target_size[0] - image.size[0]
    delta_h = target_size[1] - image.size[1]
    padding = (delta_w // 2, delta_h // 2, delta_w - (delta_w // 2), delta_h - (delta_h // 2))
    return ImageOps.expand(image, padding)

async def predict_image(file):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # 1. Improved Preprocessing: Preserve Aspect Ratio
    image = smart_resize(image, (224, 224))
    
    # 2. Normalization
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0).astype(np.float32)

    # 3. Model Inference (TFSMLayer outputs a dict)
    predictions_dict = model(image_array)
    if isinstance(predictions_dict, dict):
        predictions_tensor = list(predictions_dict.values())[0]
    else:
        predictions_tensor = predictions_dict

    # 4. Multi-class Probability Extraction (Top-K)
    probs = predictions_tensor.numpy()[0]
    top_indices = np.argsort(probs)[-3:][::-1]  # Get top 3 indices sorted descending
    
    results = []
    for idx in top_indices:
        results.append({
            "label": class_names[idx] if idx < len(class_names) else f"Class_{idx}",
            "confidence": float(probs[idx]),
            "index": int(idx)
        })

    # 5. Return Enhanced Result
    return {
        "success": True,
        "disease": results[0]["label"],
        "confidence": results[0]["confidence"],
        "alternative_diagnoses": results, # Full Top-3 list
        "is_uncertain": float(results[0]["confidence"]) < 0.70
    }
