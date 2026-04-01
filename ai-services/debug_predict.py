import numpy as np
from PIL import Image
import io
import tensorflow as tf
import os
from keras.layers import TFSMLayer
from keras import Sequential

# Setup model loading
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "plant_disease_model"
)

tfsmlayer = TFSMLayer(MODEL_PATH, call_endpoint="serving_default")
model = Sequential([tfsmlayer])
model.build((None, 224, 224, 3))

# Our current experimental labels (which are likely wrong)
DEFAULT_CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot", 
    "Pepper__bell___healthy", 
    "Potato___Early_blight", 
    "Potato___Late_blight", 
    "Potato___healthy", 
    "Tomato_Bacterial_spot", 
    "Tomato_Early_blight", 
    "Tomato_Late_blight", 
    "Tomato_Leaf_Mold", 
    "Tomato_Septoria_leaf_spot", 
    "Tomato_Spider_mites_Two_spotted_spider_mite", 
    "Tomato__Target_Spot", 
    "Tomato__Tomato_YellowLeaf__Curl_Virus", 
    "Tomato__Tomato_mosaic_virus", 
    "Tomato_healthy",
]

def debug_predict(image_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return
    try:
        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0).astype(np.float32)

        predictions_dict = model(image_array)
        if isinstance(predictions_dict, dict):
            predictions_tensor = list(predictions_dict.values())[0]
        else:
            predictions_tensor = predictions_dict
        
        probs = predictions_tensor.numpy()[0]
        
        print(f"\n--- Prediction Results for {os.path.basename(image_path)} ---")
        idx = np.argmax(probs)
        conf = probs[idx]
        print(f"WINNING INDEX: {idx}")
        print(f"PROPOSED LABEL: {DEFAULT_CLASS_NAMES[idx]}")
        print(f"CONFIDENCE: {conf:.2%}")
        
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        for path in sys.argv[1:]:
            debug_predict(path)
    else:
        print("Usage: python debug_predict.py <image_path> ...")
