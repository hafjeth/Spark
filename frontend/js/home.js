// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== BUTTON CLICK HANDLERS =====
    const btnClassify = document.querySelector('.btn-classify');
    const btnLocation = document.querySelector('.btn-location');
    
    // Phân loại rác button
    if (btnClassify) {
        btnClassify.addEventListener('click', handleClassifyClick);
    }
    
    // Điểm thu gom button
    if (btnLocation) {
        btnLocation.addEventListener('click', handleLocationClick);
    }
    
    // ===== ANIMATION ON PAGE LOAD =====
    initPageAnimation();
    
    // ===== SCROLL EFFECTS =====
    initScrollEffects();
    
});

// ===== FUNCTION: Handle Classify Button Click =====
function handleClassifyClick() {
    console.log('Phân loại rác button clicked');
    // Navigate to classify page
    window.location.href = 'classify.html';
}

// ===== FUNCTION: Handle Location Button Click =====
function handleLocationClick() {
    console.log('Điểm thu gom button clicked');
    // Navigate to location page
    window.location.href = 'map.html';
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

// ===== FUNCTION: Scroll Effects =====
function initScrollEffects() {
    let lastScrollY = window.scrollY;
    const backgroundGrid = document.querySelector('.background-grid');
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        const delta = scrollY - lastScrollY;
        
        // Animate background grid opacity on scroll
        if (backgroundGrid) {
            const currentOpacity = parseFloat(window.getComputedStyle(backgroundGrid).opacity);
            const newOpacity = Math.max(0.3, Math.min(0.9, currentOpacity + delta * 0.001));
            backgroundGrid.style.opacity = newOpacity;
        }
        
        lastScrollY = scrollY;
    });
}

// ===== FUNCTION: Window Resize Handler =====
window.addEventListener('resize', handleWindowResize);

function handleWindowResize() {
    const width = window.innerWidth;
    
    if (width < 768) {
        console.log('Mobile view active');
        // Add mobile-specific logic here
    } else if (width >= 769 && width <= 1024) {
        console.log('Tablet view active');
        // Add tablet-specific logic here
    } else {
        console.log('Desktop view active');
        // Add desktop-specific logic here
    }
}

// ===== OPTIONAL: Add custom functions below =====

// Example: Show loading state
function showLoading() {
    // Add your loading logic
}

// Example: Hide loading state
function hideLoading() {
    // Add your hide loading logic
}