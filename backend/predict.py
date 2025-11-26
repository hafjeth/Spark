import numpy as np
from keras.models import load_model
from PIL import Image

# ==== 1. Cấu hình ====
MODEL_PATH = "trash_classifier.keras"   # đúng tên file bạn đã save trong notebook
IMG_SIZE = 224

# Điền đúng thứ tự từ `print(classes)`
CLASS_NAMES = ['battery', 'biological', 'Bottle', 'cardboard', 'clothes', 'metal', 'paper', 'shoes', 'trash', 'white-glass']

# ==== 2. Load model ====
model = load_model(MODEL_PATH, compile=False)
print(">>> Model loaded OK")

# ==== 3. Tiền xử lý giống lúc train ====
def preprocess_pil_image(pil_image: Image.Image):
    image = pil_image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(image)             # shape (H, W, 3), dtype uint8
    arr = np.expand_dims(arr, axis=0) # (1, H, W, 3)
    return arr

# ==== 4. Hàm predict dùng cho FastAPI ====
def predict_image(pil_image: Image.Image):
    x = preprocess_pil_image(pil_image)
    preds = model.predict(x)[0]              # (num_classes,)

    class_idx = int(np.argmax(preds))
    class_name = CLASS_NAMES[class_idx]
    confidence = float(preds[class_idx])

    print(">>> preds:", preds)
    print(">>> class_idx:", class_idx, "class_name:", class_name, "conf:", confidence)

    return class_name, confidence