import numpy as np
import torch
import clip
import joblib
from PIL import Image
import os

# ==== 1. Cấu hình ====
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "clip-model.joblib")

LABELS = ['metal', 'Plastic-bag', 'white-glass', 'biological', 'paper', 'battery', 'trash', 'cardboard', 'shoes', 'clothes', 'Bottle']

CLIP_MODEL_NAME = "ViT-B/32"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==== 2. Load CLIP model và SVM ====
print("\n" + "="*60)
print("ĐANG TẢI CÁC MÔ HÌNH")
print("="*60)

try:
    clip_model, clip_preprocess = clip.load(CLIP_MODEL_NAME, device=DEVICE)
    print(f"✅ Đã tải CLIP model ({CLIP_MODEL_NAME})")
except Exception as e:
    print(f"❌ Lỗi tải CLIP model: {e}")
    clip_model = None

try:
    svm_model = joblib.load(MODEL_PATH)
    print("✅ Đã tải mô hình SVM (clip-model.joblib)")
except Exception as e:
    print(f"❌ Lỗi tải SVM: {e}")
    svm_model = None

# ==== 3. Hàm trích xuất đặc trưng CLIP ====
def get_clip_features(pil_image: Image.Image):
    """Trích xuất vector đặc trưng CLIP từ PIL Image"""
    if clip_model is None:
        return np.zeros((1, 512))
    
    # Tiền xử lý
    image_input = clip_preprocess(pil_image).unsqueeze(0).to(DEVICE)
    
    # Trích xuất đặc trưng
    with torch.no_grad():
        image_features = clip_model.encode_image(image_input)
    
    return image_features.cpu().numpy().reshape(1, -1)

# ==== 4. Hàm predict dùng cho FastAPI ====
def predict_image(pil_image: Image.Image):
    """Dự đoán loại rác từ ảnh PIL Image"""
    if svm_model is None or clip_model is None:
        return "Lỗi: Mô hình không tải được", 0.0
    
    try:
        # Convert sang RGB nếu cần
        image = pil_image.convert("RGB")
        
        # Trích xuất đặc trưng CLIP
        features = get_clip_features(image)
        
        # Dự đoán với SVM
        prediction_idx = int(svm_model.predict(features)[0])
        class_name = LABELS[prediction_idx]
        
        # Lấy xác suất (nếu SVM hỗ trợ decision_function)
        try:
            decision = svm_model.decision_function(features)[0]
            # Tính softmax để có xác suất
            exp_decision = np.exp(decision - np.max(decision))
            confidence = float(exp_decision[prediction_idx] / np.sum(exp_decision))
        except:
            confidence = 1.0
        
        print(f">>> class_name: {class_name}, confidence: {confidence:.4f}")
        return class_name, confidence
        
    except Exception as e:
        print(f"❌ Lỗi dự đoán: {e}")
        import traceback
        traceback.print_exc()
        return "Lỗi dự đoán", 0.0