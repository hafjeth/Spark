// ================== CONFIG BACKEND ==================
const API_URL = "http://127.0.0.1:8000/classify-trash"; 
// Nếu sau này deploy, đổi sang domain server của bạn

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== INITIALIZE ELEMENTS =====
    initElements();
    
    // ===== SETUP EVENT LISTENERS =====
    setupEventListeners();
    
    // ===== PAGE LOAD ANIMATION =====
    initPageAnimation();
    
});

// ===== GLOBAL VARIABLES =====
let uploadBox;
let processingSection;
let backButton;
let fileInput;

// ===== FUNCTION: Initialize Elements =====
function initElements() {
    uploadBox = document.querySelector('.upload-box');
    processingSection = document.querySelector('.processing-section');
    backButton = document.querySelector('.back-button');
    
    // Create hidden file input
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png, image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
}

// ===== FUNCTION: Setup Event Listeners =====
function setupEventListeners() {
    // Back button click
    if (backButton) {
        backButton.addEventListener('click', handleBackClick);
    }
    
    // Upload box click
    if (uploadBox) {
        uploadBox.addEventListener('click', handleUploadClick);
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drag and drop events
    if (uploadBox) {
        uploadBox.addEventListener('dragover', handleDragOver);
        uploadBox.addEventListener('dragleave', handleDragLeave);
        uploadBox.addEventListener('drop', handleDrop);
    }
}

// ===== FUNCTION: Handle Back Button Click =====
function handleBackClick() {
    console.log('Back button clicked');
    window.location.href = 'home.html';
}

// ===== FUNCTION: Handle Upload Box Click =====
function handleUploadClick() {
    console.log('Upload box clicked');
    fileInput.click();
}

// ===== FUNCTION: Handle File Select =====
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (file) {
        console.log('File selected:', file.name);
        
        if (validateFile(file)) {
            processFile(file);
        }
    }
}

// ===== FUNCTION: Validate File =====
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        alert('Vui lòng chọn file ảnh (JPG, PNG, WEBP)');
        return false;
    }
    
    if (file.size > maxSize) {
        alert('Kích thước file không được vượt quá 5MB');
        return false;
    }
    
    return true;
}

// ===== FUNCTION: Process File (CALL BACKEND) =====
function processFile(file) {
    console.log('Processing file:', file.name);
    
    // Hide upload box
    if (uploadBox) {
        uploadBox.style.display = 'none';
    }
    
    // Show processing section
    if (processingSection) {
        processingSection.classList.add('active');
    }

    // Đọc ảnh thành base64 để mang qua result.html hiển thị
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;

        // Gọi API backend
        classifyOnServer(file)
            .then(apiData => {
                console.log("API response:", apiData);

                // Chuẩn hóa dữ liệu cho result.html
                const classificationResult = buildResultFromApi(apiData);

                // Lưu vào sessionStorage
                sessionStorage.setItem('uploadedImage', imageData);
                sessionStorage.setItem('classificationResult', JSON.stringify(classificationResult));

                // Điều hướng sang trang kết quả
                window.location.href = 'result.html';
            })
            .catch(err => {
                console.error(err);
                alert("Có lỗi khi phân loại rác. Vui lòng thử lại sau.");

                // Nếu lỗi, cho phép người dùng upload lại
                if (uploadBox) {
                    uploadBox.style.display = 'block';
                }
                if (processingSection) {
                    processingSection.classList.remove('active');
                }
            });
    };
    reader.readAsDataURL(file);
}

// ===== FUNCTION: CALL BACKEND API =====
async function classifyOnServer(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        let detail = "Lỗi khi gọi API phân loại.";
        try {
            const err = await res.json();
            if (err.detail) detail = err.detail;
        } catch (e) {}
        throw new Error(detail);
    }

    // data: { class_id, confidence, recyclable }
    return await res.json();
}

// ===== FUNCTION: BUILD RESULT OBJECT CHO result.html =====
function buildResultFromApi(data) {
    const viName = mapClassToVietnamese(data.class_id);
    const confidencePercent = Math.round((data.confidence || 0) * 100);

    const type = data.recyclable ? "recyclable" : "non-recyclable";

    // Bạn có thể đọc suggestions từ blog.json, ở đây mình để example cứng
    let suggestions = [];

    if (type === "recyclable") {
        suggestions = [
            {
                image: '../images/suggestion-1.jpg',
                title: 'Tái chế sáng tạo tại nhà',
                description: 'Sử dụng ' + viName.toLowerCase() + ' để làm đồ trang trí, chậu cây hoặc vật dụng hữu ích.'
            },
            {
                image: '../images/suggestion-2.jpg',
                title: 'Mang đến điểm thu gom tái chế',
                description: 'Đem ' + viName.toLowerCase() + ' đến các điểm thu gom rác tái chế gần bạn.'
            }
        ];
    } else {
        suggestions = [
            {
                icon: '../images/trash-icon.png',
                title: 'Bỏ đúng thùng rác quy định',
                description: 'Đảm bảo rác được đóng gói kín, không làm rơi vãi, gây mùi hôi.'
            },
            {
                icon: '../images/warning-icon.png',
                title: 'Không trộn với rác tái chế',
                description: viName + ' không phù hợp để tái chế, hãy tách riêng khỏi giấy, nhựa, kim loại.'
            }
        ];
    }

    return {
        type: type,
        wasteCategory: viName,
        confidence: confidencePercent,
        classId: data.class_id,
        suggestions: suggestions
    };
}

// ===== FUNCTION: MAP class_id → TIẾNG VIỆT =====
function mapClassToVietnamese(classId) {
    const mapping = {
        Bottle: "Chai / chai nhựa / chai thủy tinh",
        "white-glass": "Thủy tinh trắng",
        trash: "Rác thải chung",
        shoes: "Giày dép",
        paper: "Giấy",
        metal: "Kim loại",
        clothes: "Quần áo",
        cardboard: "Bìa carton",
        biological: "Rác hữu cơ",
        Battery: "Pin"
    };

    return mapping[classId] || classId;
}

// ===== FUNCTION: Handle Drag Over =====
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (uploadBox) {
        uploadBox.style.borderColor = '#22C55E';
        uploadBox.style.background = 'rgba(34, 197, 94, 0.05)';
    }
}

// ===== FUNCTION: Handle Drag Leave =====
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (uploadBox) {
        uploadBox.style.borderColor = '#747A81';
        uploadBox.style.background = '#161B22';
    }
}

// ===== FUNCTION: Handle Drop =====
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Reset upload box style
    if (uploadBox) {
        uploadBox.style.borderColor = '#747A81';
        uploadBox.style.background = '#161B22';
    }
    
    const files = event.dataTransfer.files;
    
    if (files.length > 0) {
        const file = files[0];
        
        if (validateFile(file)) {
            processFile(file);
        }
    }
}

// ===== FUNCTION: Page Load Animation =====
function initPageAnimation() {
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
}

// ===== OPTIONAL: Paste from clipboard =====
document.addEventListener('paste', function(event) {
    const items = event.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            
            if (validateFile(file)) {
                processFile(file);
            }
            
            break;
        }
    }
});
