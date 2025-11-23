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
let suggestionsTitle;
let suggestionsContainer;

// ===== FUNCTION: Initialize Elements =====
function initElements() {
    backButton = document.querySelector('.back-button');
    uploadBox = document.querySelector('.upload-box');
    resultImage = document.getElementById('resultImage');
    resultType = document.getElementById('resultType');
    resultText = document.getElementById('resultText');
    resultButton = document.getElementById('resultButton');
    resultCard = document.getElementById('resultCard');
    suggestionsTitle = document.getElementById('suggestionsTitle');
    suggestionsContainer = document.getElementById('suggestionsContainer');
    
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

// ===== FUNCTION: Handle File Reupload =====
function handleFileReupload(event) {
    const file = event.target.files[0];
    if (file) {
        sessionStorage.clear();
        window.location.href = 'classify.html';
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
    if (result.type === 'recyclable') {
        displayRecyclableResult(result);
    } else {
        displayNonRecyclableResult(result);
    }
}

// ===== FUNCTION: Map Category to JSON Key =====
function mapCategoryToKey(category) {
    const categoryMap = {
        'Vỏ hộp': 'vo_hop',
        'Hộp carton': 'vo_hop',
        'Chai nhựa': 'chai_nhua',
        'Chai nhựa PET': 'chai_nhua',
        'Túi nhựa': 'tui_nhua',
        'Túi nilon': 'tui_nhua',
        'Hộp nhựa': 'hop_nhua_giay',
        'Hộp giấy': 'hop_nhua_giay',
        'Giấy báo': 'giay_bao',
        'Giấy': 'giay_bao',
        'Vải': 'vai_soi',
        'Vải sợi': 'vai_soi',
        'Quần áo cũ': 'vai_soi'
    };
    
    return categoryMap[category] || null;
}

// ===== FUNCTION: Load Suggestions from Blog JSON =====
async function loadSuggestionsFromJSON(categoryKey) {
    try {
        const response = await fetch('../../dataset/blog.json');
        if (!response.ok) {
            console.error('Failed to fetch blog.json:', response.status);
            return null;
        }
        const data = await response.json();
        console.log('Loaded blog data:', data);
        console.log('Looking for category key:', categoryKey);
        console.log('Found suggestions:', data[categoryKey]);
        return data[categoryKey] || null;
    } catch (error) {
        console.error('Error loading suggestions:', error);
        return null;
    }
}

// ===== FUNCTION: Display Recyclable Result =====
async function displayRecyclableResult(result) {
    const category = result.wasteCategory || 'Chai nhựa';
    
    // Update result type
    if (resultType) {
        resultType.textContent = 'Tái chế';
        resultType.classList.remove('organic');
    }
    
    // Update description
    if (resultText) {
        resultText.innerHTML = `Vật thể được xác định là <strong>${category}</strong>`;
    }
    
    // Update button
    if (resultButton) {
        resultButton.className = 'result-button';
        resultButton.innerHTML = `
            <img src="../images/recy.png" alt="Check" class="result-button-icon">
            <span>Có thể tái chế</span>
        `;
    }
    
    // Update card border
    if (resultCard) {
        resultCard.classList.remove('organic');
    }
    
    // Update suggestions title
    if (suggestionsTitle) {
        suggestionsTitle.textContent = 'Gợi ý cách tái chế';
    }
    
    // Load suggestions from blog.json
    const categoryKey = mapCategoryToKey(category);
    
    if (categoryKey) {
        const suggestions = await loadSuggestionsFromJSON(categoryKey);
        
        if (suggestions && suggestions.length > 0) {
            renderRecyclableSuggestions(suggestions);
        } else {
            loadDefaultRecyclableSuggestions();
        }
    } else {
        loadDefaultRecyclableSuggestions();
    }
}

// ===== FUNCTION: Display Non-Recyclable Result =====
function displayNonRecyclableResult(result) {
    const category = result.wasteCategory || 'Vỏ chuối';
    
    // Update result type
    if (resultType) {
        resultType.textContent = 'Hữu cơ';
        resultType.classList.add('organic');
    }
    
    // Update description
    if (resultText) {
        resultText.innerHTML = `Vật thể được xác định là <strong>${category}</strong>`;
    }
    
    // Update button
    if (resultButton) {
        resultButton.className = 'result-button organic';
        resultButton.innerHTML = `
            <img src="../images/x.png" alt="Warning" class="result-button-icon">
            <span>Không thể tái chế</span>
        `;
    }
    
    // Update card border
    if (resultCard) {
        resultCard.classList.add('organic');
    }
    
    // Update suggestions title
    if (suggestionsTitle) {
        suggestionsTitle.textContent = 'Hướng dẫn xử lý';
    }
    
    // Load fixed disposal instructions
    loadDisposalInstructions();
}

// ===== FUNCTION: Render Recyclable Suggestions =====
function renderRecyclableSuggestions(suggestions) {
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(item => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.style.cursor = 'pointer';
        
        // Add click event to open URL
        card.addEventListener('click', function() {
            window.open(item.url, '_blank');
        });
        
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="suggestion-image">
            <div class="suggestion-content">
                <h4 class="suggestion-heading">${item.title}</h4>
                <p class="suggestion-text">${item.description}</p>
            </div>
        `;
        
        suggestionsContainer.appendChild(card);
    });
}

// ===== FUNCTION: Load Disposal Instructions (Fixed for all non-recyclable) =====
function loadDisposalInstructions() {
    if (!suggestionsContainer) return;
    
    const instructions = [
        {
            icon: '../images/trash-icon.png',
            title: 'Bỏ vào thùng rác chung',
            description: 'Đảm bảo rác được đóng gói kỹ càng để tránh rơi vãi, làm bẩn hoặc gây mùi hôi.'
        },
        {
            icon: '../images/warning-icon.png',
            title: 'Không trộn lẫn với rác tái chế',
            description: 'Rác hữu cơ không thể tái chế lại với các vật liệu như nhựa, giấy, thủy tinh.'
        },
        {
            icon: '../images/compost-icon.png',
            title: 'Cân nhắc ủ phân hữu cơ',
            description: 'Nếu có điều kiện, bạn có thể ủ phân compost tại nhà để giảm rác thải.'
        }
    ];
    
    suggestionsContainer.innerHTML = '';
    
    instructions.forEach(item => {
        const card = document.createElement('div');
        card.className = 'suggestion-card disposal';
        
        card.innerHTML = `
            <div style="width: 60px; height: 60px; background: #374151; border-radius: 8px; padding: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="${item.icon}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div class="suggestion-content">
                <h4 class="suggestion-heading">${item.title}</h4>
                <p class="suggestion-text">${item.description}</p>
            </div>
        `;
        
        suggestionsContainer.appendChild(card);
    });
}

// ===== FUNCTION: Load Default Recyclable Suggestions =====
function loadDefaultRecyclableSuggestions() {
    const defaultSuggestions = [
        {
            image: '../images/suggestion-1.jpg',
            title: 'Làm đồ trang trí tại nhà',
            description: 'Biến rác tái chế thành chậu cây, đèn lồng hoặc các vật dụng trang trí độc đáo.',
            url: 'https://example.com/tai-che-sang-tao',
            source: 'greenliving.vn'
        },
        {
            image: '../images/suggestion-2.jpg',
            title: 'Làm đồ chơi cho trẻ em',
            description: 'Tạo các đồ chơi sáng tạo và an toàn để bé có thể vui chơi.',
            url: 'https://example.com/do-choi-tai-che',
            source: 'kidscraft.vn'
        },
        {
            image: '../images/suggestion-3.jpg',
            title: 'Tái sử dụng làm vật dụng hữu ích',
            description: 'Biến đồ cũ thành các vật dụng tiện lợi trong cuộc sống hàng ngày.',
            url: 'https://example.com/tai-su-dung',
            source: 'reuse.vn'
        }
    ];
    
    renderRecyclableSuggestions(defaultSuggestions);
}

// ===== FUNCTION: Display Default Result =====
function displayDefaultResult() {
    displayRecyclableResult({
        type: 'recyclable',
        wasteCategory: 'Chai nhựa',
        confidence: 95
    });
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