import numpy as np
from PIL import Image
import io
from app.model_loader import model

# Default fallback class names
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

# Attempt to get class names from the model if possible
try:
    # If your model has a `.classes` attribute or similar, use that
    # Otherwise, infer from output size
    num_classes = model.output_shape[-1]  # shape like (None, 5)
    class_names = DEFAULT_CLASS_NAMES[:num_classes]  # truncate or use fallback
except Exception as e:
    print("Warning: Could not infer class names from model. Using fallback.")
    class_names = DEFAULT_CLASS_NAMES

async def predict_image(file):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    # TFSMLayer outputs a dict: extract tensor
    predictions_dict = model(image_array)
    predictions_tensor = list(predictions_dict.values())[0]

    # Convert tensor to numpy
    predictions = predictions_tensor.numpy()

    # Find class
    index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))

    # Safety check in case number of classes differs
    if index >= len(class_names):
        disease_name = f"Class_{index}"
    else:
        disease_name = class_names[index]

    return {
        "disease": disease_name,
        "confidence": round(confidence * 100, 2)
    }
