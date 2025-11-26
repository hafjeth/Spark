from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import traceback

from predict import predict_image  


RECYCLABLE_TYPES = {
    "bottle",       
    "cardboard",
    "clothes",
    "metal",
    "paper",
    "white-glass",

}

app = FastAPI(
    title="Trash Classification API",
    description="API phân loại rác thải và xác định khả năng tái chế",
    version="1.0.0"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Trash Classification API is running",
        "docs": "/docs",
        "endpoints": {
            "classify": "/classify-trash"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/classify-trash")
async def classify_trash(file: UploadFile = File(...)):
    """
    Nhận file ảnh, gọi model trong predict.py, trả về:
    - class_id: tên lớp (theo CLASS_NAMES)
    - confidence: xác suất
    - recyclable: có tái chế được không
    - message: câu thông báo cho người dùng
    """
    print(">>> [/classify-trash] called")
    print(">>> content_type:", file.content_type)

    try:
        # ===== 1. Kiểm tra loại file =====
        if not file.content_type or "image" not in file.content_type:
            raise HTTPException(
                status_code=400,
                detail="File phải là ảnh (jpg, png, jpeg, v.v.)"
            )

        # ===== 2. Kiểm tra kích thước file =====
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        print(">>> file_size:", file_size)

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="File rỗng, vui lòng upload lại ảnh."
            )

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Kích thước file không được vượt quá 10MB."
            )

        # ===== 3. Đọc ảnh =====
        img_bytes = await file.read()
        print(">>> read bytes:", len(img_bytes))

        try:
            # predict.py đã convert RGB, nhưng ta cứ đảm bảo từ đây là PIL Image
            image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Không thể đọc ảnh: {str(e)}"
            )

        print(">>> image size:", image.size)

        # ===== 4. Gọi model predict_image (PIL Image -> (class_name, confidence)) =====
        try:
            print(">>> calling predict_image() ...")
            class_id, confidence = predict_image(image)
            print(">>> raw predict_image output:", class_id, confidence, type(class_id), type(confidence))
        except Exception as e:
            print("=== ERROR INSIDE predict_image() ===")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi gọi mô hình dự đoán: {str(e)}"
            )

        # ===== 5. Chuẩn hóa kết quả =====
        class_id_str = str(class_id)
        class_id_lower = class_id_str.lower()

        try:
            confidence_float = float(confidence)
        except Exception:
            try:
                confidence_float = float(confidence[0])
            except Exception:
                confidence_float = 0.0

        print(">>> normalized:", class_id_str, confidence_float)

        # ===== 6. Logic tái chế =====
        recyclable = class_id_lower in RECYCLABLE_TYPES

        if recyclable:
            message = f"✅ {class_id_str} có thể tái chế! Vui lòng bỏ vào thùng rác tái chế."
        else:
            message = f"❌ {class_id_str} không thể tái chế. Vui lòng bỏ vào thùng rác thông thường."

        if confidence_float < 0.5:
            message += " ⚠️ Lưu ý: Độ tin cậy thấp, kết quả có thể không chính xác."

        # ===== 7. Trả JSON =====
        return {
            "success": True,
            "class_id": class_id_str,
            "confidence": confidence_float,
            "recyclable": recyclable,
            "message": message
        }

    except HTTPException:
        print(">>> HTTPException raised in /classify-trash")
        raise
    except Exception as e:
        print("=== ERROR IN /classify-trash (outer) ===")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi phân loại ảnh (server): {str(e)}"
        )


@app.get("/recyclable-types")
async def get_recyclable_types():
    """
    Lấy danh sách các loại rác được đánh dấu là có thể tái chế trong hệ thống.
    """
    return {
        "recyclable_types": list(RECYCLABLE_TYPES),
        "count": len(RECYCLABLE_TYPES)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
