import numpy as np
from PIL import Image
import requests
import io
import tensorflow as tf
import os
from keras.layers import TFSMLayer
from keras import Sequential
import urllib.parse

# Correct URLs with exact filenames gathered from GitHub
BASE_URL = "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/"

# Dictionary mapping intended Label -> GitHub Folder/File path
SAMPLES = {
    "Pepper__bell___Bacterial_spot": "Pepper%2C_bell___Bacterial_spot/0022d6b7-7503-490e-b816-f365dc303ba1___JR_Bact.S%203139.JPG",
    "Pepper__bell___healthy": "Pepper%2C_bell___healthy/00100ffa-095e-4881-aebf-61fe5af7226e___JR_HL%207886.JPG",
    "Potato___Early_blight": "Potato___Early_blight/001187a0-57ab-4329-baff-e7246a9edeb0___RS_Early.B%208178.JPG",
    "Potato___Late_blight": "Potato___Late_blight/0051e5e8-d1c4-4a84-bf3a-a426cdad6285___RS_LB%204640.JPG",
    "Potato___healthy": "Potato___healthy/00fc2ee5-729f-4757-8aeb-65c3355874f2___RS_HL%201864.JPG",
    "Tomato_Bacterial_spot": "Tomato___Bacterial_spot/00416648-be6e-4bd4-bc8d-82f43f8a7240___GCREC_Bact.Sp%203110.JPG",
    "Tomato_Early_blight": "Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG",
    "Tomato_healthy": "Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL%20Leaf%20259.1.JPG",
    "Tomato_Late_blight": "Tomato___Late_blight/0003faa8-4b27-4c65-bf42-6d9e352ca1a5___RS_Late.B%204946.JPG",
    "Tomato_Leaf_Mold": "Tomato___Leaf_Mold/00694db7-3327-45e0-b4da-a8bb7ab6a4b7___Crnl_L.Mold%206923.JPG",
    "Tomato_Septoria_leaf_spot": "Tomato___Septoria_leaf_spot/002533c1-722b-44e5-9d2e-91f7747b2543___Keller.St_CG%201831.JPG",
    "Tomato_Spider_mites": "Tomato___Spider_mites%20Two-spotted_spider_mite/002835d1-c18e-4471-aa6e-8d8c29585e9b___Com.G_SpM_FL%208584.JPG",
    "Tomato_Target_Spot": "Tomato___Target_Spot/002213fb-b620-4593-b9ac-6a6cc119b100___Com.G_TgS_FL%208360.JPG",
    "Tomato_Yellow_Leaf_Curl": "Tomato___Tomato_Yellow_Leaf_Curl_Virus/00139ae8-d881-4edb-925f-46584b0bd68c___YLCV_NREC%202944.JPG",
    "Tomato_mosaic_virus": "Tomato___Tomato_mosaic_virus/000ec6ea-9063-4c33-8abe-d58ca8a88878___PSU_CG%202169.JPG"
}

# Load model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "plant_disease_model")
tfsmlayer = TFSMLayer(MODEL_PATH, call_endpoint="serving_default")
model = Sequential([tfsmlayer])
model.build((None, 224, 224, 3))

def get_prediction(img_url):
    try:
        resp = requests.get(img_url, timeout=15)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert("RGB").resize((224, 224))
        arr = np.array(img) / 255.0
        arr = np.expand_dims(arr, axis=0).astype(np.float32)
        
        preds = model(arr)
        if isinstance(preds, dict):
            preds = list(preds.values())[0]
        
        return np.argmax(preds.numpy()[0])
    except Exception as e:
        print(f"Error for {img_url}: {e}")
        return None

results = {}
print("Starting systematic profiling of all 15 classes...")

for label, relative_path in SAMPLES.items():
    url = BASE_URL + relative_path
    idx = get_prediction(url)
    if idx is not None:
        results[idx] = label
        print(f"Index {idx:2} => {label}")

print("\n--- FINAL RECOMMENDED MAPPING ---")
final_mapping = []
for i in range(15):
    name = results.get(i, f"UNKNOWN_INDEX_{i}")
    final_mapping.append(name)
    print(f"Index {i:2}: {name}")

print("\nArray for predict.py:")
print(repr(final_mapping))
