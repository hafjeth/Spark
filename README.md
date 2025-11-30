# Trash Classification Application

An AI-powered trash classification system using Deep Learning to identify and categorize waste from images, determining recyclability status.

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Project Structure](#project-structure)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [Technical Specifications](#technical-specifications)

## Overview

This application provides an automated solution for waste classification using computer vision. The system accepts image inputs and utilizes a trained EfficientNetB2 model to classify waste into 10 categories, subsequently determining recyclability.

### Key Features

- Image-based waste classification
- EfficientNetB2 deep learning architecture
- Recyclability determination
- Confidence score reporting
- RESTful API interface
- Responsive web interface

## System Requirements

### Hardware Requirements

- Processor: Multi-core CPU (Intel i5 or equivalent)
- RAM: Minimum 4GB (8GB recommended)
- Storage: 2GB available space
- Network: Internet connection for initial setup

### Software Requirements

- Operating System: Windows 10/11, macOS 10.14+, or Linux
- Python: Version 3.8 - 3.10
- Anaconda/Miniconda (recommended)
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)

## Installation

### Step 1: Repository Setup

```bash
git clone https://github.com/yourusername/Spark.git
cd Spark
```

### Step 2: Environment Configuration

Create and activate a new conda environment:

```bash
conda create -n spark_env python=3.9
conda activate spark_env
```

### Step 3: Dependencies Installation

Navigate to the backend directory and install required packages:

```bash
cd backend
pip install fastapi uvicorn python-multipart
pip install tensorflow pillow numpy
pip install protobuf==3.20.3
```

Alternatively, use the requirements file:

```bash
pip install -r requirements.txt
```

### Step 4: Model Setup

Ensure the trained model file `trash_classifier.keras` is placed in the backend directory:

```
Spark/
├── backend/
│   ├── main.py
│   ├── predict.py
│   └── trash_classifier.keras
└── frontend/
```

## Running the Application

### Backend Server

From the backend directory, start the FastAPI server:

```bash
cd backend
conda activate spark_env
python -m uvicorn main:app --reload
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The backend server will be available at `http://127.0.0.1:8000`

### Frontend Server

#### Method A: Using Live Server (VS Code)

1. Install the Live Server extension in Visual Studio Code
2. Open `frontend/html/classify.html`
3. Right-click and select "Open with Live Server"
4. Access at `http://127.0.0.1:5500`

#### Method B: Using Python HTTP Server

```bash
cd frontend
python -m http.server 5500
```

Access the application at `http://127.0.0.1:5500/html/classify.html`

## Project Structure

```
Spark/
│
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── predict.py              # Model inference module
│   ├── trash_classifier.keras  # Trained model weights
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── html/
│   │   ├── home.html          # Landing page
│   │   ├── classify.html      # Image upload interface
│   │   └── result.html        # Classification results display
│   ├── css/
│   │   └── styles.css         # Application stylesheets
│   ├── js/
│   │   ├── classify.js        # Classification logic
│   │   └── result.js          # Results rendering
│   └── images/                # Static assets
│
└── README.md
```

## API Documentation

### Base URL

```
http://127.0.0.1:8000
```

### Endpoints

#### 1. Root Endpoint

```
GET /
```

Response:
```json
{
  "message": "Trash Classification API is running",
  "docs": "/docs",
  "endpoints": {
    "classify": "/classify-trash"
  }
}
```

#### 2. Classification Endpoint

```
POST /classify-trash
```

Request Parameters:
- Content-Type: `multipart/form-data`
- Body: Image file (JPEG, PNG, WEBP)
- Maximum file size: 10MB

Response:
```json
{
  "success": true,
  "class_id": "Bottle",
  "confidence": 0.95,
  "recyclable": true,
  "message": "Bottle is recyclable. Please dispose in recycling bin."
}
```

#### 3. Recyclable Types

```
GET /recyclable-types
```

Response:
```json
{
  "recyclable_types": ["bottle", "paper", "cardboard", "clothes", "Plastic-bag", "metal", "glass"],
  "count": 7
}
```

### Interactive Documentation

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Module Not Found Error

```
ModuleNotFoundError: No module named 'XXX'
```

Solution:
```bash
pip install XXX
```

#### Issue 2: Model File Format Error

```
ValueError: File format not supported
```

Solution:
- Verify `trash_classifier.keras` exists in `backend/` directory
- Ensure model file format is `.keras` or `.h5`
- Check file integrity and permissions

#### Issue 3: NumPy/Protobuf Version Conflict

```
numpy.dtype size changed, may indicate binary incompatibility
```

Solution:
```bash
pip uninstall h5py protobuf -y
pip install h5py protobuf==3.20.3 --no-cache-dir
```

#### Issue 4: CORS Error

```
Access to fetch blocked by CORS policy
```

Solution:
- Verify backend server is running
- Check CORS middleware configuration in `main.py`
- Ensure frontend is accessing correct backend URL

#### Issue 5: Connection Refused

```
Failed to fetch / Connection refused
```

Solution:
- Confirm backend server is running on port 8000
- Check firewall settings
- Verify no port conflicts

#### Issue 6: Model Loading Issues

Solution:
- Check available RAM (minimum 4GB required)
- Verify model file integrity
- Re-download model if corrupted

## Technical Specifications

### Model Architecture

- Base Architecture: EfficientNetB2
- Input Dimensions: 260 x 260 x 3
- Number of Classes: 10
- Optimization: RMSprop
- Framework: TensorFlow/Keras

### Classification Categories

1. Bottle
2. White Glass
3. General Trash
4. Shoes
5. Paper
6. Metal
7. Clothes
8. Cardboard
9. Biological Waste
10. Battery
11. Plastic bag

### Recyclable Categories

- Bottle
- Paper
- Cardboard
- Clothes
- Plastic bag
- Metal
- Glass

### Performance Considerations

- Model Inference Time: Approximately 100-500ms per image
- Supported Image Formats: JPEG, PNG, WEBP
- Maximum Image Size: 10MB
- Recommended Image Resolution: Minimum 260x260 pixels
- Confidence Threshold: 0.5 (50%)

## Testing

### Backend Testing

Test root endpoint:
```bash
curl http://127.0.0.1:8000
```

Test classification endpoint:
```bash
curl -X POST "http://127.0.0.1:8000/classify-trash" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### Frontend Testing

1. Open browser Developer Tools (F12)
2. Navigate to Console tab
3. Upload test image
4. Monitor network requests in Network tab
5. Verify API responses

## Notes

- Model trained on 10 distinct waste categories
- Confidence scores range from 0.0 to 1.0
- Backend supports hot-reload during development
- Frontend compatible with static file servers
- CORS configured for cross-origin requests

## License

This project is licensed under the MIT License.

## Authors

- Initial Development Team

## References

1. Tan, M., & Le, Q. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks. ICML.
2. FastAPI Documentation: https://fastapi.tiangolo.com
3. TensorFlow Documentation: https://www.tensorflow.org