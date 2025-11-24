// Load locations from JSON file
let locations = [];

fetch('../../dataset/locations.json')
    .then(response => response.json())
    .then(data => {
        locations = data;
        init();
    })
    .catch(error => {
        console.error('Error loading locations:', error);
        // Fallback data if JSON file not found
        locations = [
            {
                id: 1,
                name: "Trung tâm tái chế trung tâm",
                address: "123 Đường Hàng Xanh, Phường X, Quận Y",
                distance: 1.2,
                status: "open",
                closeTime: "17:00",
                hours: "8:00 - 17:00",
                types: ["plastic", "seafood", "paper"],
                lat: 45,
                lng: 40
            },
            {
                id: 2,
                name: "Trung tâm tái chế trung tâm",
                address: "123 Đường Hàng Xanh, Phường X, Quận Y",
                distance: 1.2,
                status: "closing",
                closeTime: "20:00",
                hours: "8:00 - 20:00",
                types: ["plastic", "electronics"],
                lat: 55,
                lng: 50
            },
            {
                id: 3,
                name: "Trung tâm tái chế trung tâm",
                address: "123 Đường Hàng Xanh, Phường X, Quận Y",
                distance: 1.2,
                status: "closed",
                closeTime: "",
                hours: "Đã đóng cửa",
                types: ["electronics", "paper"],
                lat: 35,
                lng: 60
            }
        ];
        init();
    });

let selectedLocation = null;
let activeFilter = 'all';
let zoomLevel = 1;

const typeIcons = {
    plastic: '🧴',
    seafood: '🦐',
    electronics: '📱',
    paper: '📄'
};

const typeNames = {
    plastic: 'Nhựa',
    seafood: 'Thủy tinh',
    electronics: 'Điện tử',
    paper: 'Giấy'
};

const statusText = {
    open: 'Đang mở',
    closing: 'Sắp đóng cửa',
    closed: 'Đã đóng cửa'
};

// Render location cards
function renderLocations() {
    const listContainer = document.getElementById('locationList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = locations.filter(loc => {
        const matchesSearch = loc.name.toLowerCase().includes(searchTerm) || 
                            loc.address.toLowerCase().includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || loc.types.includes(activeFilter);
        return matchesSearch && matchesFilter;
    });

    listContainer.innerHTML = filtered.map(loc => `
        <div class="location-card ${loc.id === selectedLocation.id ? 'selected' : ''}" onclick="selectLocation(${loc.id})">
            <div class="card-header">
                <div>
                    <div class="card-title">${loc.name}</div>
                    <div class="card-address">${loc.address}</div>
                </div>
                <div class="card-distance">${loc.distance} km</div>
            </div>
            <div class="card-status ${loc.status}">
                <span class="status-dot"></span>
                ${statusText[loc.status]}${loc.closeTime ? ' • Đóng cửa lúc ' + loc.closeTime : ''}
            </div>
            <div class="card-types">
                ${loc.types.map(type => `
                    <div class="type-icon">${typeIcons[type]}</div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render map markers
function renderMarkers() {
    const mapContainer = document.getElementById('mapContainer');
    const existingMarkers = mapContainer.querySelectorAll('.map-marker');
    existingMarkers.forEach(m => m.remove());

    locations.forEach(loc => {
        const marker = document.createElement('div');
        marker.className = `map-marker ${loc.id === selectedLocation.id ? 'active' : ''}`;
        marker.style.left = `${loc.lng}%`;
        marker.style.top = `${loc.lat}%`;
        marker.style.transform = `translate(-50%, -50%) scale(${zoomLevel})`;
        marker.onclick = () => selectLocation(loc.id);
        marker.innerHTML = `
            <svg viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        `;
        mapContainer.appendChild(marker);
    });
}

// Select location
window.selectLocation = function(id) {
    selectedLocation = locations.find(loc => loc.id === id);
    renderLocations();
    renderMarkers();
    updateRightPanel();
};

// Update right panel
function updateRightPanel() {
    document.getElementById('detailName').textContent = selectedLocation.name;
    document.getElementById('detailAddress').textContent = selectedLocation.address;
    document.getElementById('detailHours').textContent = 'Giờ hoạt động: ' + selectedLocation.hours;
    
    const typesHtml = selectedLocation.types.map(type => `
        <span class="waste-pill">
            <span>${typeIcons[type]}</span>
            ${typeNames[type]}
        </span>
    `).join('');
    document.getElementById('detailTypes').innerHTML = typesHtml;
}

// Filter pills
document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', function() {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.dataset.type;
        renderLocations();
    });
});

// Search
document.getElementById('searchInput').addEventListener('input', renderLocations);

// Map controls
document.getElementById('zoomIn').addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 2);
    renderMarkers();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 0.6);
    renderMarkers();
});

document.getElementById('locate').addEventListener('click', () => {
    selectLocation(locations[0].id);
});

// Directions button
document.getElementById('directionsBtn').addEventListener('click', () => {
    alert(`Đang mở chỉ đường đến ${selectedLocation.name}\n${selectedLocation.address}`);
});

// Initialize function
function init() {
    if (locations.length > 0) {
        selectedLocation = locations[0];
        renderLocations();
        renderMarkers();
        updateRightPanel();
    }
}