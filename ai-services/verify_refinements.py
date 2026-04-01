import numpy as np
from PIL import Image
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(__file__))

from app.predict import smart_resize, predict_image
import io

class MockFile:
    def __init__(self, content):
        self.content = content
    async def read(self):
        return self.content

async def run_test():
    # 1. Create a dummy test image (non-square)
    img = Image.new('RGB', (100, 300), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    
    print(f"Original Size: {img.size}")
    
    # 2. Test Smart Resizer
    resized = smart_resize(img, (224, 224))
    print(f"Resized Size: {resized.size}")
    if resized.size == (224, 224):
        print("Smart Resizer passed: Correct target size.")
    else:
        print("Smart Resizer failed: Wrong target size.")

    # 3. Test Prediction Logic (Mocking the run)
    mock_file = MockFile(img_bytes)
    try:
        result = await predict_image(mock_file)
        print("\n--- Model Output (Top-3) ---")
        print(f"Primary Disease: {result['disease']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print("Alternatives:")
        for alt in result['alternative_diagnoses']:
            print(f"- {alt['label']}: {alt['confidence']:.2%}")
        
        if 'alternative_diagnoses' in result and len(result['alternative_diagnoses']) == 3:
            print("Top-K Results passed.")
        else:
            print("Top-K Results failed (Incomplete list).")
            
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_test())
