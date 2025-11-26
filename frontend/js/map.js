// Global variables
let map;
let userMarker;
let userLocation = null;
let locations = [];
let markers = [];
let selectedLocation = null;
let activeFilter = 'all';
let routeLayer = null;

const typeIcons = {
    plastic: '<img src="../images/map/plastic.png" alt="Nhựa" class="type-img">',
    glass: '<img src="../images/map/glass.png" alt="Thủy tinh" class="type-img">',
    electronics: '<img src="../images/map/elec.png" alt="Điện tử" class="type-img">',
    paper: '<img src="../images/map/paper.png" alt="Giấy" class="type-img">'
};

const typeNames = {
    plastic: 'Nhựa',
    glass: 'Thủy tinh',
    electronics: 'Điện tử',
    paper: 'Giấy'
};

const statusText = {
    open: 'Đang mở',
    closing: 'Sắp đóng cửa',
    closed: 'Đã đóng cửa'
};

// Initialize Leaflet Map
function initMap() {
    // Create map centered on Ho Chi Minh City
    map = L.map('mapContainer', {
        center: [10.8231, 106.6297],
        zoom: 13,
        zoomControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Get user location
    getUserLocation();

    // Load locations data
    loadLocations();
}

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center map on user location
                map.setView([userLocation.lat, userLocation.lng], 13);

                // Add user marker with custom icon
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `
                        <div class="pulse"></div>
                        <div class="dot"></div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                userMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: userIcon,
                    title: 'Vị trí của bạn'
                }).addTo(map);

                // Recalculate distances after getting user location
                if (locations.length > 0) {
                    calculateDistances();
                    renderLocations();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Use default location (Ho Chi Minh City center)
                userLocation = { lat: 10.8231, lng: 106.6297 };
            }
        );
    } else {
        alert('Trình duyệt không hỗ trợ định vị.');
        userLocation = { lat: 10.8231, lng: 106.6297 };
    }
}

// Load locations from JSON
function loadLocations() {
    fetch('../../../dataset/location.json')
        .then(response => response.json())
        .then(data => {
            locations = data;
            calculateDistances();
            renderLocations();
            renderMarkers();
            if (locations.length > 0) {
                selectLocation(locations[0].id);
            }
        })
        .catch(error => {
            console.error('Error loading locations:', error);
            // Fallback data
            locations = [
                {
                    id: 1,
                    name: "Trung tâm tái chế Quận 1",
                    address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
                    lat: 10.7756,
                    lng: 106.7019,
                    openTime: "08:00",
                    closeTime: "17:00",
                    types: ["plastic", "glass", "paper"]
                },
                {
                    id: 2,
                    name: "Điểm thu gom Quận 3",
                    address: "456 Đường Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3",
                    lat: 10.7869,
                    lng: 106.6887,
                    openTime: "08:00",
                    closeTime: "20:00",
                    types: ["plastic", "electronics"]
                },
                {
                    id: 3,
                    name: "Trung tâm tái chế Bình Thạnh",
                    address: "789 Đường Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh",
                    lat: 10.8117,
                    lng: 106.7105,
                    openTime: "08:00",
                    closeTime: "18:00",
                    types: ["electronics", "paper"]
                },
                {
                    id: 4,
                    name: "Điểm thu gom Phú Nhuận",
                    address: "234 Đường Phan Xích Long, Phường 2, Phú Nhuận",
                    lat: 10.7993,
                    lng: 106.6821,
                    openTime: "07:00",
                    closeTime: "19:00",
                    types: ["plastic", "paper", "electronics"]
                },
                {
                    id: 5,
                    name: "Trung tâm tái chế Quận 10",
                    address: "567 Đường 3 Tháng 2, Phường 12, Quận 10",
                    lat: 10.7722,
                    lng: 106.6678,
                    openTime: "08:00",
                    closeTime: "17:00",
                    types: ["glass", "electronics", "paper"]
                },
                {
                    id: 6,
                    name: "Điểm thu gom Tân Bình",
                    address: "890 Đường Hoàng Văn Thụ, Phường 4, Tân Bình",
                    lat: 10.7993,
                    lng: 106.6532,
                    openTime: "08:00",
                    closeTime: "20:00",
                    types: ["plastic", "glass"]
                },
                {
                    id: 7,
                    name: "Trung tâm tái chế Quận 7",
                    address: "321 Đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7",
                    lat: 10.7352,
                    lng: 106.7191,
                    openTime: "08:00",
                    closeTime: "18:00",
                    types: ["electronics", "paper"]
                },
                {
                    id: 8,
                    name: "Điểm thu gom Gò Vấp",
                    address: "654 Đường Quang Trung, Phường 10, Gò Vấp",
                    lat: 10.8376,
                    lng: 106.6672,
                    openTime: "07:00",
                    closeTime: "19:00",
                    types: ["plastic", "glass", "paper", "electronics"]
                }
            ];
            calculateDistances();
            renderLocations();
            renderMarkers();
            if (locations.length > 0) {
                selectLocation(locations[0].id);
            }
        });
}

// Calculate distances using Haversine formula
function calculateDistances() {
    if (!userLocation) return;

    locations.forEach(loc => {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(loc.lat - userLocation.lat);
        const dLng = toRad(loc.lng - userLocation.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(loc.lat)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        loc.distance = (R * c).toFixed(1);
    });

    // Sort by distance
    locations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Determine location status
function getLocationStatus(location) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = location.openTime.split(':').map(Number);
    const [closeHour, closeMin] = location.closeTime.split(':').map(Number);
    
    const openTimeMin = openHour * 60 + openMin;
    const closeTimeMin = closeHour * 60 + closeMin;
    
    if (currentTime < openTimeMin || currentTime >= closeTimeMin) {
        return 'closed';
    } else if (closeTimeMin - currentTime <= 60) {
        return 'closing';
    } else {
        return 'open';
    }
}

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

    listContainer.innerHTML = filtered.map(loc => {
        const status = getLocationStatus(loc);
        const hours = `${loc.openTime} - ${loc.closeTime}`;
        
        return `
        <div class="location-card ${selectedLocation && loc.id === selectedLocation.id ? 'selected' : ''}" onclick="selectLocation(${loc.id})">
            <div class="card-header">
                <div>
                    <div class="card-title">${loc.name}</div>
                    <div class="card-address">${loc.address}</div>
                </div>
                <div class="card-distance">${loc.distance} km</div>
            </div>
            <div class="card-status ${status}">
                <span class="status-dot"></span>
                ${statusText[status]}${status !== 'closed' ? ' • Đóng cửa lúc ' + loc.closeTime : ''}
            </div>
            <div class="card-types">
                ${loc.types.map(type => `
                    <div class="type-icon">${typeIcons[type]}</div>
                `).join('')}
            </div>
        </div>
    `}).join('');
}

// Render map markers
function renderMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Filter locations
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = locations.filter(loc => {
        const matchesSearch = loc.name.toLowerCase().includes(searchTerm) || 
                            loc.address.toLowerCase().includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || loc.types.includes(activeFilter);
        return matchesSearch && matchesFilter;
    });

    filtered.forEach(loc => {
        const isActive = selectedLocation && loc.id === selectedLocation.id;
        
        const markerIcon = L.divIcon({
            className: 'location-marker' + (isActive ? ' active' : ''),
            html: `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const marker = L.marker([loc.lat, loc.lng], {
            icon: markerIcon,
            title: loc.name
        }).addTo(map);

        marker.on('click', () => selectLocation(loc.id));
        markers.push(marker);
    });
}

// Select location
window.selectLocation = function(id) {
    selectedLocation = locations.find(loc => loc.id === id);
    renderLocations();
    renderMarkers();
    updateRightPanel();
    
    // Pan map to selected location
    if (selectedLocation) {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
            duration: 1
        });
    }
};

// Update right panel
function updateRightPanel() {
    if (!selectedLocation) return;
    
    const status = getLocationStatus(selectedLocation);
    const hours = `${selectedLocation.openTime} - ${selectedLocation.closeTime}`;
    
    document.getElementById('detailName').textContent = selectedLocation.name;
    document.getElementById('detailAddress').textContent = selectedLocation.address;
    document.getElementById('detailHours').textContent = 'Giờ hoạt động: ' + hours;
    
    const statusLabel = document.querySelector('.status-label');
    statusLabel.textContent = statusText[status];
    statusLabel.className = `status-label ${status}`;
    
    const typesHtml = selectedLocation.types.map(type => `
        <span class="waste-pill">
            ${typeIcons[type]}
            ${typeNames[type]}
        </span>
    `).join('');
    document.getElementById('detailTypes').innerHTML = typesHtml;
    }

// Get directions using OSRM (Open Source Routing Machine)
async function getDirections() {
    if (!userLocation || !selectedLocation) {
        alert('Không thể lấy vị trí của bạn hoặc chưa chọn địa điểm.');
        return;
    }

    // Remove previous route if exists
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }

    // Use OSRM Demo Server (completely free, no API key needed)
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedLocation.lng},${selectedLocation.lat}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];

            // Add route to map
            routeLayer = L.geoJSON(route.geometry, {
                style: {
                    color: '#22C55E',
                    weight: 5,
                    opacity: 0.8
                }
            }).addTo(map);

            // Get distance and duration
            const distance = (route.distance / 1000).toFixed(1); // Convert to km
            const duration = Math.round(route.duration / 60); // Convert to minutes

            alert(`Khoảng cách: ${distance} km\nThời gian: ${duration} phút`);

            // Fit map to show entire route
            map.fitBounds(routeLayer.getBounds(), {
                padding: [50, 50]
            });
        } else {
            alert('Không thể tìm đường đi. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Directions error:', error);
        alert('Có lỗi xảy ra khi tìm đường đi. Server có thể đang bận.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initMap();

    // Filter pills
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            activeFilter = this.dataset.type;
            renderLocations();
            renderMarkers();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', () => {
        renderLocations();
        renderMarkers();
    });

    // Map controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        map.zoomIn();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        map.zoomOut();
    });

    document.getElementById('locate').addEventListener('click', () => {
        if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 15, {
                duration: 1
            });
        } else {
            getUserLocation();
        }
    });

    // Directions button
    document.getElementById('directionsBtn').addEventListener('click', () => {
        getDirections();
    });

    // Back button
    document.querySelector('.back-button').addEventListener('click', () => {
        window.history.back();
    });
});