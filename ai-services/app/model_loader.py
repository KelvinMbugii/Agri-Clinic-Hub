import tensorflow as tf
import os
from keras.layers import TFSMLayer
from keras import Sequential

print("Loading Ai model...")

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "model",
    "plant_disease_model"
)

# Load SaveModel as inference Layer
tfsmlayer = TFSMLayer(MODEL_PATH, call_endpoint="serving_default")

# Wrap in Sequential model
model = Sequential([tfsmlayer])

print("Model loaded successfully!")