// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== INITIALIZE ELEMENTS =====
    initElements();
    
    // ===== SETUP EVENT LISTENERS =====
    setupEventListeners();
    
    // ===== PAGE LOAD ANIMATION =====
    initPageAnimation();
    
    // ===== LOAD RESULT DATA =====
    loadResultData();
});

// ===== GLOBAL VARIABLES =====
let backButton;
let uploadBox;
let fileInput;
let resultImage;
let resultType;
let resultText;
let resultButton;
let resultCard;

// 🔗 URL backend của bạn
const API_URL = "http://127.0.0.1:8000/classify-trash";

// ===== FUNCTION: Initialize Elements =====
function initElements() {
    backButton = document.querySelector('.back-button');
    uploadBox = document.querySelector('.upload-box');
    resultImage = document.getElementById('resultImage');
    resultType = document.getElementById('resultType');
    resultText = document.getElementById('resultText');
    resultButton = document.getElementById('resultButton');
    resultCard = document.getElementById('resultCard');
    
    // Create hidden file input
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png, image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
}

// ===== FUNCTION: Setup Event Listeners =====
function setupEventListeners() {
    // Back button
    if (backButton) {
        backButton.addEventListener('click', handleBackClick);
    }
    
    // Upload box for re-upload
    if (uploadBox) {
        uploadBox.addEventListener('click', handleReuploadClick);
    }
    
    // File input
    if (fileInput) {
        // 👇 cho phép dùng async/await bên trong
        fileInput.addEventListener('change', handleFileReupload);
    }
}

// ===== FUNCTION: Handle Back Button =====
function handleBackClick() {
    window.location.href = 'classify.html';
}

// ===== FUNCTION: Handle Reupload Click =====
function handleReuploadClick() {
    fileInput.click();
}

// ===== FUNCTION: Map model class_id -> tên tiếng Việt =====
function mapModelClassToWasteCategory(classId) {
    if (!classId) return 'Rác tái chế';

    switch (classId.toLowerCase()) {
        case 'battery':
            return 'Pin';
        case 'biological':
            return 'Rác hữu cơ';
        case 'bottle':
            return 'Chai nhựa';
        case 'cardboard':
            return 'Bìa carton';
        case 'clothes':
            return 'Quần áo cũ';
        case 'metal':
            return 'Kim loại';
        case 'paper':
            return 'Giấy';
        case 'shoes':
            return 'Giày dép';
        case 'trash':
            return 'Rác thải tổng hợp';
        case 'white-glass':
            return 'Thủy tinh trắng';
        default:
            return classId; // fallback: giữ nguyên chuỗi gốc
    }
}

// ===== FUNCTION: Map API result -> format frontend đang dùng =====
function mapApiResultToFrontend(apiData) {
    const wasteCategory = mapModelClassToWasteCategory(apiData.class_id);
    const confidencePercent = Math.round((apiData.confidence || 0) * 100);

    return {
        type: apiData.recyclable ? 'recyclable' : 'non-recyclable',
        wasteCategory: wasteCategory,
        confidence: confidencePercent
        // suggestions sẽ được load từ blog.json hoặc default, nên không cần gán ở đây
    };
}

// ===== FUNCTION: Handle File Reupload =====
async function handleFileReupload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        alert('Vui lòng chọn file ảnh (JPG, PNG, WEBP)');
        return;
    }
    
    if (file.size > maxSize) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
    }

    // Hiển thị ảnh mới ngay lập tức (base64) + lưu vào sessionStorage
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        sessionStorage.setItem('uploadedImage', imageData);
        if (resultImage) {
            resultImage.src = imageData;
        }
    };
    reader.readAsDataURL(file);

    // Gọi API backend để phân loại ảnh mới
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('API error status:', response.status);
            let errMsg = 'Có lỗi khi phân loại rác. Vui lòng thử lại sau.';
            try {
                const err = await response.json();
                if (err && err.detail) {
                    errMsg = err.detail;
                }
            } catch (_) {}
            alert(errMsg);
            return;
        }

        const apiData = await response.json();
        console.log('API result:', apiData);

        const result = mapApiResultToFrontend(apiData);

        // Lưu result mới vào sessionStorage
        sessionStorage.setItem('classificationResult', JSON.stringify(result));

        // Cập nhật UI với kết quả mới
        displayResult(result);

    } catch (error) {
        console.error('Error calling API:', error);
        alert('Không thể kết nối tới server. Vui lòng kiểm tra lại backend.');
    }
}

// ===== FUNCTION: Load Result Data =====
function loadResultData() {
    const imageData = sessionStorage.getItem('uploadedImage');
    const resultData = sessionStorage.getItem('classificationResult');
    
    // Display uploaded image
    if (imageData && resultImage) {
        resultImage.src = imageData;
    }
    
    // Parse and display result
    if (resultData) {
        try {
            const result = JSON.parse(resultData);
            displayResult(result);
        } catch (error) {
            console.error('Error parsing result:', error);
            displayDefaultResult();
        }
    } else {
        displayDefaultResult();
    }
}

// ===== FUNCTION: Display Result =====
function displayResult(result) {
    // Update image
    if (resultImage && result.imagePath) {
        resultImage.src = result.imagePath;
    }
    
    // Check if recyclable
    if (result.recyclable) {
        displayRecyclableResult(result);
    } else {
        displayNonRecyclableResult(result);
    }
}

// ===== FUNCTION: Display Recyclable Result =====
function displayRecyclableResult(result) {
    let category = result.wasteCategory || 'Tái chế';
    
    // ✅ Map tên tiếng Anh -> tiếng Việt
    const categoryMap = {
        'metal': 'Kim loại',
        'Plastic-bag': 'Túi ni lông',
        'white-glass': 'Kính trắng',
        'biological': 'Chất sinh học',
        'paper': 'Giấy',
        'battery': 'Pin/Acquy',
        'trash': 'Rác thải',
        'cardboard': 'Carton',
        'shoes': 'Giày',
        'clothes': 'Quần áo',
        'Bottle': 'Chai'
    };
    
    category = categoryMap[category] || category;
    
    if (resultType) {
        resultType.textContent = category;
        resultType.classList.remove('organic');
    }
    
    if (resultText) {
        resultText.innerHTML = '';
    }
    
    if (resultButton) {
        resultButton.style.display = 'none';
    }
    
    if (resultCard) {
        resultCard.classList.remove('organic');
    }
}

// ===== FUNCTION: Display Non-Recyclable Result =====
function displayNonRecyclableResult(result) {
    let category = result.wasteCategory || 'Chất thải';
    
    // ✅ Map tên tiếng Anh -> tiếng Việt
    const categoryMap = {
        'metal': 'Kim loại',
        'Plastic-bag': 'Túi ni lông',
        'white-glass': 'Kính trắng',
        'biological': 'Chất sinh học',
        'paper': 'Giấy',
        'battery': 'Pin/Acquy',
        'trash': 'Rác thải',
        'cardboard': 'Carton',
        'shoes': 'Giày',
        'clothes': 'Quần áo',
        'Bottle': 'Chai'
    };
    
    category = categoryMap[category] || category;
    
    if (resultType) {
        resultType.textContent = category;
        resultType.classList.remove('organic');
    }
    
    if (resultText) {
        resultText.innerHTML = '';
    }
    
    if (resultButton) {
        resultButton.style.display = 'none';
    }
    
    if (resultCard) {
        resultCard.classList.remove('organic');
    }
}

// ===== FUNCTION: Display Default Result =====
function displayDefaultResult() {
    if (resultType) {
        resultType.textContent = 'Tái chế';
        resultType.classList.remove('organic');  // ✅ Giữ màu xanh
    }
    if (resultText) resultText.innerHTML = '';
    if (resultButton) resultButton.style.display = 'none';
    if (resultCard) resultCard.classList.remove('organic');  // ✅ Card giữ border xanh
}

// ===== FUNCTION: Page Load Animation =====
function initPageAnimation() {
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
}
