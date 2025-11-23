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

// ===== FUNCTION: Process File =====
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
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Simulate AI processing (3 seconds)
        setTimeout(() => {
            console.log('Processing complete');
            
            // Get mock result
            const mockResult = getMockClassificationResult();
            
            // Store in sessionStorage
            sessionStorage.setItem('uploadedImage', imageData);
            sessionStorage.setItem('classificationResult', JSON.stringify(mockResult));
            
            // Navigate to result page
            window.location.href = 'result.html';
        }, 3000);
    };
    reader.readAsDataURL(file);
}

// ===== FUNCTION: Get Mock Classification Result =====
function getMockClassificationResult() {
    const mockResults = [
        {
            type: 'recyclable',
            wasteCategory: 'Chai nhựa PET',
            confidence: 95,
            suggestions: [
                {
                    image: '../images/suggestion-1.jpg',
                    title: 'Làm đồ trang trí tại nhà',
                    description: 'Biến chai nhựa cũ thành chậu cây, đèn lồng hoặc các vật dụng trang trí độc đáo khác.'
                },
                {
                    image: '../images/suggestion-2.jpg',
                    title: 'Làm đồ chơi cho trẻ em',
                    description: 'Tạo các đồ chơi sáng tạo và an toàn từ chai nhựa để bé có thể vui chơi.'
                },
                {
                    image: '../images/suggestion-3.jpg',
                    title: 'Tái sử dụng làm bình tưới cây',
                    description: 'Đục lỗ nhỏ ở nắp chai và sử dụng làm bình tưới cây tiện lợi.'
                }
            ]
        },
        {
            type: 'non-recyclable',
            wasteCategory: 'Vỏ chuối',
            confidence: 92,
            suggestions: [
                {
                    icon: '../images/trash-icon.png',
                    title: 'Bỏ vào thùng rác chung',
                    description: 'Đảm bảo rác được đóng gói kỹ càng để tránh rơi vãi, làm bẩn hoặc gây mùi hôi.'
                },
                {
                    icon: '../images/warning-icon.png',
                    title: 'Không trộn lẫn với rác tái chế',
                    description: 'Vỏ chuối là rác hữu cơ nên không thể tái chế lại với các vật liệu như nhựa, giấy.'
                },
                {
                    icon: '../images/compost-icon.png',
                    title: 'Cân nhắc ủ phân hữu cơ',
                    description: 'Nếu có điều kiện, bạn có thể ủ phân compost tại nhà để giảm rác thải.'
                }
            ]
        },
        {
            type: 'recyclable',
            wasteCategory: 'Lon nhôm',
            confidence: 98,
            suggestions: [
                {
                    image: '../images/suggestion-1.jpg',
                    title: 'Tái chế tại trung tâm thu gom',
                    description: 'Lon nhôm có thể tái chế 100% và tiết kiệm năng lượng đáng kể.'
                },
                {
                    image: '../images/suggestion-2.jpg',
                    title: 'Làm đồ thủ công',
                    description: 'Biến lon nhôm thành các vật dụng trang trí hoặc đồ dùng hữu ích.'
                },
                {
                    image: '../images/suggestion-3.jpg',
                    title: 'Đổi lấy tiền tại điểm thu mua',
                    description: 'Nhiều nơi thu mua lon nhôm cũ với giá hợp lý.'
                }
            ]
        }
    ];
    
    // Random select
    const randomIndex = Math.floor(Math.random() * mockResults.length);
    return mockResults[randomIndex];
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