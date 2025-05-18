// Global değişkenler
let map;
let directionsService;
let directionsRenderer;
let autocompleteStart;
let autocompleteEnd;
let accessibilityPoints = []; // Erişilebilirlik noktaları (rampalar, asansörler vb.)
let markers = []; // Haritadaki tüm işaretleyicileri takip et
let activeMode = null; // Aktif seçim modu: 'START_POINT', 'END_POINT', 'RAMP', 'ELEVATOR', 'STAIRS'

// Nokta tipleri ve simgeleri
const POINT_TYPES = {
    RAMP: {
        name: 'Rampa',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        accessible: true // Erişilebilir
    },
    ELEVATOR: {
        name: 'Asansör',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        accessible: true // Erişilebilir
    },
    STAIRS: {
        name: 'Merdiven',
        icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        accessible: false // Erişilemez
    },
    START: {
        name: 'Başlangıç Noktası',
        icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
    },
    END: {
        name: 'Varış Noktası',
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }
};

// Başlangıç ve bitiş noktası işaretçileri
let startMarker = null;
let endMarker = null;

// Sayfa yüklendiğinde çalışacak fonksiyon
function initMap() {
    // Google Maps'i başlat
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.9334, lng: 32.8597 }, // Ankara, Türkiye
        zoom: 15,
        mapTypeControl: false
    });
    
    // Yönlendirme servisleri
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directions-panel'),
        suppressMarkers: true // Kendi özel başlangıç/bitiş işaretçilerimizi kullanacağız
    });
    
    // Otomatik tamamlama için
    setupAutocomplete();
    
    // Erişilebilirlik noktalarını yükle
    loadAccessibilityPoints();
    
    // Haritaya eklenen erişilebilirlik noktalarını göster
    renderAccessibilityPoints();
    
    // Olay dinleyicileri
    setupEventListeners();
    
    // Konum erişimi ve mevcut konumu gösterme
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.setCenter(pos);
                
                // Mevcut konumu işaretle
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2
                    },
                    title: "Mevcut Konumunuz"
                });
            },
            () => {
                console.log("Konum izni verilmedi veya konum alınamadı.");
            }
        );
    }
}

// Olay dinleyicileri kurulumu
function setupEventListeners() {
    // Rota butonu için olay dinleyicisi
    document.getElementById('routeButton').addEventListener('click', calculateAndDisplayRoute);
    
    // Erişilebilirlik araçları için olay dinleyicileri
    document.getElementById('addRampBtn').addEventListener('click', () => setActiveMode('RAMP'));
    document.getElementById('addElevatorBtn').addEventListener('click', () => setActiveMode('ELEVATOR'));
    document.getElementById('addStairsBtn').addEventListener('click', () => setActiveMode('STAIRS'));
    document.getElementById('clearPointsBtn').addEventListener('click', clearAllAccessibilityPoints);
    
    // Başlangıç ve bitiş noktası seçme butonları
    document.getElementById('pickStartBtn').addEventListener('click', () => setActiveMode('START_POINT'));
    document.getElementById('pickEndBtn').addEventListener('click', () => setActiveMode('END_POINT'));
    
    // Haritaya tıklama olayı
    map.addListener('click', handleMapClick);
    
    // Input alanları değiştiğinde işaretleyicileri güncelle
    document.getElementById('start').addEventListener('input', updateStartMarkerFromAddress);
    document.getElementById('end').addEventListener('input', updateEndMarkerFromAddress);
}

// Otomatik tamamlama kurulumu
function setupAutocomplete() {
    autocompleteStart = new google.maps.places.Autocomplete(
        document.getElementById('start'),
        { types: ['address'] }
    );
    
    autocompleteEnd = new google.maps.places.Autocomplete(
        document.getElementById('end'),
        { types: ['address'] }
    );
    
    autocompleteStart.bindTo('bounds', map);
    autocompleteEnd.bindTo('bounds', map);
    
    // Place seçildiğinde işaretleyici ekle
    autocompleteStart.addListener('place_changed', () => {
        const place = autocompleteStart.getPlace();
        if (place.geometry && place.geometry.location) {
            updateStartMarker(place.geometry.location);
        }
    });
    
    autocompleteEnd.addListener('place_changed', () => {
        const place = autocompleteEnd.getPlace();
        if (place.geometry && place.geometry.location) {
            updateEndMarker(place.geometry.location);
        }
    });
}

// Aktif modu ayarla (rampa eklemek, başlangıç/bitiş noktası seçmek vb.)
function setActiveMode(mode) {
    // Eğer aynı butona tekrar tıklanırsa, aktif modu kapat
    if (activeMode === mode) {
        activeMode = null;
        document.getElementById('clickMode').textContent = 'Yok';
        document.getElementById('addRampBtn').classList.remove('active');
        document.getElementById('addElevatorBtn').classList.remove('active');
        document.getElementById('addStairsBtn').classList.remove('active');
        document.getElementById('pickStartBtn').classList.remove('active');
        document.getElementById('pickEndBtn').classList.remove('active');
        map.getDiv().classList.remove('map-selecting-point');
    } else {
        activeMode = mode;
        
        // Tıklama modu bilgisini güncelle
        let modeName = '';
        
        // Butonları güncelle
        document.getElementById('addRampBtn').classList.remove('active');
        document.getElementById('addElevatorBtn').classList.remove('active');
        document.getElementById('addStairsBtn').classList.remove('active');
        document.getElementById('pickStartBtn').classList.remove('active');
        document.getElementById('pickEndBtn').classList.remove('active');
        
        // İlgili butonu aktifleştir
        switch(mode) {
            case 'RAMP':
                document.getElementById('addRampBtn').classList.add('active');
                modeName = 'Rampa Ekleme';
                break;
            case 'ELEVATOR':
                document.getElementById('addElevatorBtn').classList.add('active');
                modeName = 'Asansör Ekleme';
                break;
            case 'STAIRS':
                document.getElementById('addStairsBtn').classList.add('active');
                modeName = 'Merdiven Ekleme';
                break;
            case 'START_POINT':
                document.getElementById('pickStartBtn').classList.add('active');
                modeName = 'Başlangıç Noktası Seçme';
                break;
            case 'END_POINT':
                document.getElementById('pickEndBtn').classList.add('active');
                modeName = 'Varış Noktası Seçme';
                break;
        }
        
        document.getElementById('clickMode').textContent = modeName;
        map.getDiv().classList.add('map-selecting-point');
        
        // Kullanıcıya bilgi ver
        if (mode === 'RAMP' || mode === 'ELEVATOR' || mode === 'STAIRS') {
            let pointType = '';
            if (mode === 'RAMP') pointType = 'rampa';
            else if (mode === 'ELEVATOR') pointType = 'asansör';
            else pointType = 'merdiven';
            
            alert(`Haritada bir konum seçin ve ${pointType} ekleyin.`);
        } else if (mode === 'START_POINT' || mode === 'END_POINT') {
            alert(`Haritada ${mode === 'START_POINT' ? 'başlangıç' : 'varış'} konumunu seçin.`);
        }
    }
}

// Haritaya tıklama olayını işle
function handleMapClick(event) {
    if (!activeMode) return; // Eğer aktif bir mod yoksa, tıklamayı işleme
    
    const clickedPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
    };
    
    switch(activeMode) {
        case 'RAMP':
        case 'ELEVATOR':
        case 'STAIRS':
            addAccessibilityPoint(activeMode, clickedPosition);
            break;
        case 'START_POINT':
            updateStartMarker(clickedPosition);
            // Adresi de güncelle
            updateAddressField('start', clickedPosition);
            break;
        case 'END_POINT':
            updateEndMarker(clickedPosition);
            // Adresi de güncelle
            updateAddressField('end', clickedPosition);
            break;
    }
    
    // Aktif modu sıfırla
    setActiveMode(activeMode); // Aynı modu tekrar çağırarak devre dışı bırak
}

// Koordinatlara göre adres alanını güncelle
function updateAddressField(fieldId, position) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
            document.getElementById(fieldId).value = results[0].formatted_address;
        } else {
            document.getElementById(fieldId).value = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        }
    });
}

// Adres değiştiğinde başlangıç işaretçisini güncelle
function updateStartMarkerFromAddress() {
    const address = document.getElementById('start').value;
    if (!address) {
        if (startMarker) {
            startMarker.setMap(null);
            startMarker = null;
        }
        return;
    }
    
    // Geocoding servisi ile adresi koordinatlara dönüştür
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            updateStartMarker(results[0].geometry.location);
        }
    });
}

// Adres değiştiğinde bitiş işaretçisini güncelle
function updateEndMarkerFromAddress() {
    const address = document.getElementById('end').value;
    if (!address) {
        if (endMarker) {
            endMarker.setMap(null);
            endMarker = null;
        }
        return;
    }
    
    // Geocoding servisi ile adresi koordinatlara dönüştür
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            updateEndMarker(results[0].geometry.location);
        }
    });
}

// Başlangıç işaretçisini güncelle
function updateStartMarker(position) {
    // Eğer bir önceki işaretçi varsa, kaldır
    if (startMarker) {
        startMarker.setMap(null);
    }
    
    // Yeni işaretçi oluştur
    startMarker = new google.maps.Marker({
        position: position,
        map: map,
        icon: POINT_TYPES.START.icon,
        title: POINT_TYPES.START.name,
        animation: google.maps.Animation.DROP,
        draggable: true // Sürüklenebilir
    });
    
    // Sürükleme bittiğinde adres güncellemesi yap
    startMarker.addListener('dragend', () => {
        updateAddressField('start', startMarker.getPosition().toJSON());
    });
}

// Bitiş işaretçisini güncelle
function updateEndMarker(position) {
    // Eğer bir önceki işaretçi varsa, kaldır
    if (endMarker) {
        endMarker.setMap(null);
    }
    
    // Yeni işaretçi oluştur
    endMarker = new google.maps.Marker({
        position: position,
        map: map,
        icon: POINT_TYPES.END.icon,
        title: POINT_TYPES.END.name,
        animation: google.maps.Animation.DROP,
        draggable: true // Sürüklenebilir
    });
    
    // Sürükleme bittiğinde adres güncellemesi yap
    endMarker.addListener('dragend', () => {
        updateAddressField('end', endMarker.getPosition().toJSON());
    });
}

// Başlangıç ve bitiş işaretleyicilerini güncelle
function updateMarkersFromRoute(route) {
    if (!startMarker || !endMarker) {
        const firstLeg = route.legs[0];
        
        if (!startMarker) {
            updateStartMarker(firstLeg.start_location);
            document.getElementById('start').value = firstLeg.start_address;
        }
        
        if (!endMarker) {
            updateEndMarker(firstLeg.end_location);
            document.getElementById('end').value = firstLeg.end_address;
        }
    }
}

// Erişilebilirlik noktası ekle
function addAccessibilityPoint(type, position) {
    // Yeni erişilebilirlik noktası ekle
    const newPoint = {
        id: Date.now(), // Benzersiz ID
        type: type,
        position: position,
        timestamp: new Date().toISOString()
    };
    
    // Noktayı diziye ekle
    accessibilityPoints.push(newPoint);
    
    // Noktaları kaydet
    saveAccessibilityPoints();
    
    // Noktayı haritada göster
    addMarkerForPoint(newPoint);
    
    // Nokta sayısını güncelle
    updatePointCount();
}

// Erişilebilirlik noktası için işaretleyici ekle
function addMarkerForPoint(point) {
    const pointInfo = POINT_TYPES[point.type];
    
    const marker = new google.maps.Marker({
        position: point.position,
        map: map,
        icon: pointInfo.icon,
        title: `${pointInfo.name} #${point.id}`
    });
    
    // Merdiven etrafında bir daire çiz (erişilemez alanı göstermek için)
    let circle = null;
    if (point.type === 'STAIRS') {
        circle = new google.maps.Circle({
            strokeColor: '#FFCC00',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FFCC00',
            fillOpacity: 0.2,
            map: map,
            center: point.position,
            radius: 20, // 20 metre çapında bir daire
            clickable: false
        });
    }
    
    // Bilgi penceresi ekle
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <h3>${pointInfo.name}</h3>
                <p>Ekleme Tarihi: ${new Date(point.timestamp).toLocaleString()}</p>
                ${typeof pointInfo.accessible !== 'undefined' ? 
                    `<p class="${pointInfo.accessible ? 'accessible-label' : 'inaccessible-label'}">
                        Tekerlekli sandalye erişimi: ${pointInfo.accessible ? 'Var' : 'Yok'}
                    </p>` : ''}
                <button onclick="deleteAccessibilityPoint(${point.id})">Bu Noktayı Sil</button>
            </div>
        `
    });
    
    // Tıklama olayı ekle
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    // İşaretleyiciyi diziye ekle
    markers.push({
        id: point.id,
        marker: marker,
        circle: circle,
        infoWindow: infoWindow
    });
    
    return marker;
}

// Erişilebilirlik noktalarını yerel depolamadan yükle
function loadAccessibilityPoints() {
    const savedPoints = localStorage.getItem('accessibilityPoints');
    if (savedPoints) {
        accessibilityPoints = JSON.parse(savedPoints);
        updatePointCount();
    }
}

// Erişilebilirlik noktalarını yerel depolamaya kaydet
function saveAccessibilityPoints() {
    localStorage.setItem('accessibilityPoints', JSON.stringify(accessibilityPoints));
}

// Tüm erişilebilirlik noktalarını göster
function renderAccessibilityPoints() {
    // Önce tüm işaretleyicileri temizle
    clearMarkers();
    
    // Sonra tüm noktaları ekle
    accessibilityPoints.forEach(point => {
        addMarkerForPoint(point);
    });
}

// İşaretleyicileri temizle
function clearMarkers() {
    markers.forEach(marker => {
        marker.marker.setMap(null);
        if (marker.circle) {
            marker.circle.setMap(null);
        }
    });
    markers = [];
}

// Nokta sayısını güncelle
function updatePointCount() {
    document.getElementById('pointCount').textContent = accessibilityPoints.length;
}

// Belirli bir erişilebilirlik noktasını sil
function deleteAccessibilityPoint(id) {
    // Noktayı diziden kaldır
    accessibilityPoints = accessibilityPoints.filter(point => point.id !== id);
    
    // Noktaları kaydet
    saveAccessibilityPoints();
    
    // Noktaları yeniden göster
    renderAccessibilityPoints();
    
    // Nokta sayısını güncelle
    updatePointCount();
}

// Tüm erişilebilirlik noktalarını temizle
function clearAllAccessibilityPoints() {
    if (confirm('Tüm erişilebilirlik noktalarını silmek istediğinizden emin misiniz?')) {
        accessibilityPoints = [];
        saveAccessibilityPoints();
        renderAccessibilityPoints();
        updatePointCount();
    }
}

// Rota hesaplama ve gösterme
function calculateAndDisplayRoute() {
    // Başlangıç ve bitiş değerlerini al
    let start, end;
    
    // İşaretleyicilere göre başlangıç ve bitiş noktalarını belirle
    if (startMarker) {
        start = startMarker.getPosition().toJSON();
    } else {
        start = document.getElementById('start').value;
        if (!start) {
            alert('Lütfen başlangıç noktasını belirleyin');
            return;
        }
    }
    
    if (endMarker) {
        end = endMarker.getPosition().toJSON();
    } else {
        end = document.getElementById('end').value;
        if (!end) {
            alert('Lütfen varış noktasını belirleyin');
            return;
        }
    }
    
    const useAccessibleRoute = document.getElementById('accessibleRoute').checked;
    
    // Erişilebilir rota isteniyor mu?
    if (useAccessibleRoute) {
        // DEĞİŞİKLİK: Merdiven noktalarını bulma ve kontrol etme kısmını çıkardık
        // Doğrudan erişilebilir rota hesapla
        calculateStandardRoute(start, end, true);
    } else {
        // Normal rota hesaplama (erişilebilir olmayan)
        calculateStandardRoute(start, end, false);
    }
}


// Standart rota hesaplama (erişilebilir veya değil)
function calculateStandardRoute(start, end, accessible) {
    const routeRequest = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true
    };
    
    // Erişilebilir ise, sadece rampa ve asansörleri rota üzerine ekle
    if (accessible) {
        // DEĞİŞİKLİK: Sadece rampa ve asansör noktalarını filtrele, merdivenleri dahil etme
        const accessiblePoints = accessibilityPoints.filter(point => 
            point.type === 'RAMP' || point.type === 'ELEVATOR'
        );
        
        if (accessiblePoints.length > 0) {
            addWaypointsToRequest(routeRequest, start, end, accessiblePoints);
        } else {
            calculateRoute(routeRequest);
        }
    } else {
        calculateRoute(routeRequest);
    }
}

// Waypoint'leri ekle
// Waypoint'leri ekle
function addWaypointsToRequest(request, start, end, accessiblePoints) {
    // Start ve end için LatLng nesneleri oluştur
    const startLatLng = (typeof start === 'string') ? null : new google.maps.LatLng(start.lat, start.lng);
    const endLatLng = (typeof end === 'string') ? null : new google.maps.LatLng(end.lat, end.lng);
    
    // Eğer koordinatlar varsa, waypoint'leri ekle
    if (startLatLng && endLatLng) {
        const waypoints = findBestAccessibleWaypoints(startLatLng, endLatLng, accessiblePoints);
        if (waypoints.length > 0) {
            request.waypoints = waypoints;
        }
    }
    
    // Rotayı hesapla
    calculateRoute(request);
}

// Çoklu rotalar deneme ve en iyi erişilebilir rotayı bulma
function tryMultipleRoutes(start, end, stairsPoints) {
    // 1. İlk olarak çok sayıda alternatif rota talep edelim
    const routeRequest = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true,
        provideRouteAlternatives: true  // Alternatif rotaları iste
    };
    
    // Rampa ve asansörleri erişilebilir noktaları waypoint olarak ekle
    const accessiblePoints = accessibilityPoints.filter(point => 
        POINT_TYPES[point.type].accessible === true
    );
    
    // Çoklu rotaları deneyelim ve en iyisini seçelim
    directionsService.route(routeRequest, (response, status) => {
        if (status === 'OK') {
            // Tüm alternatif rotaları değerlendir
            let bestRoute = null;
            let maxStairsDistance = -1;
            let bestRouteIndex = 0;
            
            // Her alternatif rotayı değerlendir
            response.routes.forEach((route, index) => {
                // Bu rotanın merdivenlere olan minimum mesafesini hesapla
                const minStairsDistance = evaluateRouteForStairs(route, stairsPoints);
                
                // En uzak mesafe en iyi rotayı gösterir (merdivenlerden en çok kaçınan)
                if (minStairsDistance > maxStairsDistance) {
                    maxStairsDistance = minStairsDistance;
                    bestRoute = route;
                    bestRouteIndex = index;
                }
                
                console.log(`Rota ${index} - Merdivene min mesafe: ${minStairsDistance} metre`);
            });
            
            // En iyi rotayı seçtik, şimdi waypoint'leri ekleyelim
            if (bestRoute && accessiblePoints.length > 0) {
                tryRouteWithWaypoints(start, end, accessiblePoints, stairsPoints, bestRouteIndex);
            } else if (bestRoute) {
                // En iyi rotayı göster
                const newResponse = { ...response, routes: [bestRoute] };
                directionsRenderer.setDirections(newResponse);
                displayRouteSummary(bestRoute, maxStairsDistance);
                updateMarkersFromRoute(bestRoute);
                console.log("Merdivenlerden kaçınan rota bulundu, mesafe:", maxStairsDistance);
            } else {
                // Hiçbir rota bulunamadıysa, merdivenleri görmezden gel
                calculateStandardRoute(start, end, true);
            }
        } else {
            // Alternatif rotalar yoksa standart erişilebilir rota hesapla
            calculateStandardRoute(start, end, true);
        }
    });
}

// Waypoint'lerle gelişmiş rota hesaplama
function tryRouteWithWaypoints(start, end, accessiblePoints, stairsPoints, preferredRouteIndex) {
    // Rampa/asansör noktalarını waypoint olarak ekle
    const routeRequestWithWaypoints = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true,
        provideRouteAlternatives: true  // Alternatifler iste
    };
    
    // Waypoint'leri ekle
    if (typeof start !== 'string' && typeof end !== 'string') {
        const startLatLng = new google.maps.LatLng(start.lat, start.lng);
        const endLatLng = new google.maps.LatLng(end.lat, end.lng);
        
        // Erişilebilir waypoint'leri ekle
        const waypoints = findOptimalWaypoints(startLatLng, endLatLng, accessiblePoints, stairsPoints);
        if (waypoints.length > 0) {
            routeRequestWithWaypoints.waypoints = waypoints;
            routeRequestWithWaypoints.optimizeWaypoints = false; // Sırayı korumak için false
        }
    }
    
    // Bu sefer waypoint'lerle rota hesapla
    directionsService.route(routeRequestWithWaypoints, (response, status) => {
        if (status === 'OK') {
            let selectedRoute = response.routes[0]; // Varsayılan olarak ilk rotayı al
            
            // Tercih edilen rota indeksi varsa ve geçerliyse onu kullan
            if (preferredRouteIndex < response.routes.length) {
                selectedRoute = response.routes[preferredRouteIndex];
            }
            
            // Son kez kontrol et - bu rotanın merdivenlere mesafesi yeterince uzak mı?
            const stairsDistance = evaluateRouteForStairs(selectedRoute, stairsPoints);
            
            // Rotayı göster
            const newResponse = { ...response, routes: [selectedRoute] };
            directionsRenderer.setDirections(newResponse);
            displayRouteSummary(selectedRoute, stairsDistance);
            updateMarkersFromRoute(selectedRoute);
            
            console.log(`Waypoint'li rota seçildi. Merdivene mesafe: ${stairsDistance} metre`);
        } else {
            // Waypoint'lerle rota bulunamadıysa, standart erişilebilir rota
            calculateStandardRoute(start, end, true);
        }
    });
}

// Optimal waypoint'leri bul - merdivenlerden uzak duran rotalar için
function findOptimalWaypoints(startLatLng, endLatLng, accessiblePoints, stairsPoints) {
    const MAX_WAYPOINTS = 8; // Google API limiti
    const waypointCandidates = [];
    
    // Erişilebilir noktaları ekle
    accessiblePoints.forEach(point => {
        const pointLatLng = new google.maps.LatLng(point.position.lat, point.position.lng);
        waypointCandidates.push({
            position: pointLatLng,
            type: point.type,
            isAccessible: true
        });
    });
    
    // Merdivenlerden kaçınan yardımcı noktalar ekle
    stairsPoints.forEach(stair => {
        const stairLatLng = new google.maps.LatLng(stair.position.lat, stair.position.lng);
        
        // Merdivene 90 derece açılarla yardımcı noktalar oluştur - kaçınma için
        const distanceFromStairs = 50; // 50 metre (bu mesafe merdivenlerden uzaklığı belirler)
        const angles = [0, 90, 180, 270]; // Dört yönde
        
        angles.forEach(angle => {
            // Merdivenden belirli bir mesafe ve açıda nokta oluştur
            const avoidPoint = google.maps.geometry.spherical.computeOffset(
                stairLatLng, distanceFromStairs, angle
            );
            
            // Bu noktayı aday listesine ekle (kaçınma noktası)
            waypointCandidates.push({
                position: avoidPoint,
                type: 'AVOID_POINT',
                isAvoidPoint: true,
                stairsRef: stair.id,
                angle: angle
            });
        });
    });
    
    // Başlangıç-bitiş çizgisini oluştur
    const startToEndBearing = google.maps.geometry.spherical.computeHeading(startLatLng, endLatLng);
    
    // Waypoint adaylarını, rota ile olan paralelliklerine göre sırala
    // Rotaya paralel noktalar daha iyidir çünkü rotayı az değiştirir ama merdivenlerden kaçınır
    waypointCandidates.sort((a, b) => {
        const bearingA = google.maps.geometry.spherical.computeHeading(startLatLng, a.position);
        const bearingB = google.maps.geometry.spherical.computeHeading(startLatLng, b.position);
        
        // Rota yönüne olan açı farkı - düşük olan daha iyidir
        const angleDiffA = Math.abs(angleDifference(bearingA, startToEndBearing));
        const angleDiffB = Math.abs(angleDifference(bearingB, startToEndBearing));
        
        // Erişilebilir noktalar her zaman öncelikli
        if (a.isAccessible && !b.isAccessible) return -1;
        if (!a.isAccessible && b.isAccessible) return 1;
        
        // İkisi de kaçınma noktası ise, rotaya daha paralel olanı seç
        if (a.isAvoidPoint && b.isAvoidPoint) {
            return angleDiffA - angleDiffB;
        }
        
        // Diğer durumlar için varsayılan sıralama
        return 0;
    });
    
    // En iyi MAX_WAYPOINTS kadar adayı seç
    return waypointCandidates.slice(0, MAX_WAYPOINTS).map(candidate => {
        return {
            location: candidate.position,
            stopover: candidate.isAccessible // Sadece erişilebilir noktalar durak olsun
        };
    });
}

// En iyi erişilebilir waypoint'leri bul
// En iyi erişilebilir waypoint'leri bul
function findBestAccessibleWaypoints(startLatLng, endLatLng, accessiblePoints) {
    // Maksimum 8 waypoint ekleyebiliriz (Google Maps API sınırlaması)
    const MAX_WAYPOINTS = 8;
    
    // Erişilebilir noktaları rotaya yakınlıklarına göre sırala
    const sortedPoints = accessiblePoints.map(point => {
        const pointLatLng = new google.maps.LatLng(point.position.lat, point.position.lng);
        const distanceToLine = distanceToLineSegment(pointLatLng, startLatLng, endLatLng);
        
        return {
            ...point,
            distance: distanceToLine
        };
    }).sort((a, b) => a.distance - b.distance);
    
    // İlk MAX_WAYPOINTS kadar noktayı al
    return sortedPoints.slice(0, MAX_WAYPOINTS).map(point => {
        return {
            location: new google.maps.LatLng(point.position.lat, point.position.lng),
            stopover: true
        };
    });
}

// İki açı arasındaki farkı hesapla (0-180 arası)
function angleDifference(angle1, angle2) {
    // Açıları 0-360 aralığına getir
    angle1 = (angle1 + 360) % 360;
    angle2 = (angle2 + 360) % 360;
    
    // İki açı arasındaki farkı hesapla (0-180 arası)
    let diff = Math.abs(angle1 - angle2) % 360;
    if (diff > 180) diff = 360 - diff;
    
    return diff;
}

// Rotanın merdivenlerden ne kadar uzak olduğunu değerlendir
function evaluateRouteForStairs(route, stairsPoints) {
    if (!route || !route.legs || route.legs.length === 0 || stairsPoints.length === 0) {
        return Infinity; // Merdiven yoksa veya rota yoksa sorun yok
    }
    
    let minDistance = Infinity;
    
    // Her bacak için
    route.legs.forEach(leg => {
        // Her adımın yolu için
        leg.steps.forEach(step => {
            // Bu adımın başlangıç ve bitiş noktaları
            const stepPoints = [];
            stepPoints.push(step.start_location);
            stepPoints.push(step.end_location);
            
            // Adımın ayrıntılı yolu varsa ekle
            if (step.path && step.path.length > 0) {
                stepPoints.push(...step.path);
            }
            
            // Bu adımın tüm noktaları için
            stepPoints.forEach(point => {
                // Her merdiven noktası için en yakın mesafeyi hesapla
                stairsPoints.forEach(stair => {
                    const stairLatLng = new google.maps.LatLng(
                        stair.position.lat,
                        stair.position.lng
                    );
                    
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        point,
                        stairLatLng
                    );
                    
                    // En küçük mesafeyi güncelle
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                });
            });
        });
    });
    
    return minDistance === Infinity ? 1000 : minDistance; // Varsayılan olarak büyük bir mesafe
}

// Başlangıç ve bitiş arasındaki rota üzerinde en yakın erişilebilirlik noktalarını bul
function findNearestAccessibilityPoints(startCoords, endCoords, useAccessibleRoute) {
    // Maksimum 8 waypoint ekleyebiliriz (Google Maps API sınırlaması)
    const MAX_WAYPOINTS = 8;
    
    let filteredPoints = [];
    
    // Erişilebilir rota isteniyorsa, sadece erişilebilir noktaları dahil et
    if (useAccessibleRoute) {
        // Sadece erişilebilir noktaları (rampa ve asansör) dahil et, merdivenleri hariç tut
        filteredPoints = accessibilityPoints.filter(point => 
            POINT_TYPES[point.type].accessible === true
        );
    } else {
        // Normal rota için tüm noktaları kullan
        filteredPoints = accessibilityPoints;
    }
    
    // Noktaları mesafeye göre sırala
    const sortedPoints = filteredPoints.map(point => {
        const pointLatLng = new google.maps.LatLng(point.position.lat, point.position.lng);
        const distanceToLine = distanceToLineSegment(
            pointLatLng,
            startCoords,
            endCoords
        );
        
        return {
            ...point,
            distance: distanceToLine
        };
    }).sort((a, b) => a.distance - b.distance);
    
    // En yakın noktaları waypoint olarak ekle
    return sortedPoints.slice(0, MAX_WAYPOINTS).map(point => {
        return {
            location: new google.maps.LatLng(point.position.lat, point.position.lng),
            stopover: true
        };
    });
}

// Bir noktanın iki nokta arasındaki çizgiye olan mesafesini hesapla
function distanceToLineSegment(p, v, w) {
    // p: ölçülen nokta, v: başlangıç noktası, w: bitiş noktası
    const l2 = distanceSquared(v, w);
    
    if (l2 === 0) return google.maps.geometry.spherical.computeDistanceBetween(p, v); // v == w durumu
    
    // Çizgi üzerindeki en yakın noktayı bul
    const v_lat = typeof v.lat === 'function' ? v.lat() : v.lat;
    const v_lng = typeof v.lng === 'function' ? v.lng() : v.lng;
    const w_lat = typeof w.lat === 'function' ? w.lat() : w.lat;
    const w_lng = typeof w.lng === 'function' ? w.lng() : w.lng;
    const p_lat = typeof p.lat === 'function' ? p.lat() : p.lat;
    const p_lng = typeof p.lng === 'function' ? p.lng() : p.lng;
    
    let t = ((p_lng - v_lng) * (w_lng - v_lng) + (p_lat - v_lat) * (w_lat - v_lat)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projection = new google.maps.LatLng(
        v_lat + t * (w_lat - v_lat),
        v_lng + t * (w_lng - v_lng)
    );
    
    return google.maps.geometry.spherical.computeDistanceBetween(p, projection);
}

// İki nokta arasındaki mesafenin karesini hesapla (vektör için)
function distanceSquared(v, w) {
    const v_lat = typeof v.lat === 'function' ? v.lat() : v.lat;
    const v_lng = typeof v.lng === 'function' ? v.lng() : v.lng;
    const w_lat = typeof w.lat === 'function' ? w.lat() : w.lat;
    const w_lng = typeof w.lng === 'function' ? w.lng() : w.lng;
    
    return Math.pow(v_lng - w_lng, 2) + Math.pow(v_lat - w_lat, 2);
}

// Rota hesaplama
function calculateRoute(request) {
    directionsService.route(request, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            
            // Başlangıç ve bitiş işaretçilerini göster/güncelle
            if (!startMarker || !endMarker) {
                const route = response.routes[0].legs[0];
                
                if (!startMarker) {
                    updateStartMarker(route.start_location);
                    document.getElementById('start').value = route.start_address;
                }
                
                if (!endMarker) {
                    updateEndMarker(route.end_location);
                    document.getElementById('end').value = route.end_address;
                }
            }
            
            // Rota özeti gösterme
            const route = response.routes[0];
            displayRouteSummary(route);
        } else {
            handleRouteError(status);
        }
    });
}

// Rota hatalarını yönet
function handleRouteError(status) {
    let errorMessage = 'Yönlendirme isteği başarısız oldu: ';
    
    switch(status) {
        case 'ZERO_RESULTS':
            errorMessage += 'Bu iki nokta arasında yürüyerek ulaşılabilecek bir rota bulunamadı.';
            break;
        case 'NOT_FOUND':
            errorMessage += 'En az bir adres bulunamadı.';
            break;
        case 'OVER_QUERY_LIMIT':
            errorMessage += 'Günlük sorgu limitini aştınız.';
            break;
        default:
            errorMessage += status;
    }
    
    alert(errorMessage);
}

// Rota özeti gösterme fonksiyonu
function displayRouteSummary(route, stairsDistance = null) {
    // Toplam mesafe ve süreyi hesapla
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Mesafe ve süreyi formatla
    const formattedDistance = (totalDistance / 1000).toFixed(2) + ' km';
    const formattedDuration = Math.ceil(totalDuration / 60) + ' dakika';
    
    const accessibleRoute = document.getElementById('accessibleRoute').checked;
    
    // Erişilebilirlik noktalarını türlerine göre say
    const rampCount = accessibilityPoints.filter(point => point.type === 'RAMP').length;
    const elevatorCount = accessibilityPoints.filter(point => point.type === 'ELEVATOR').length;
    const stairsCount = accessibilityPoints.filter(point => point.type === 'STAIRS').length;
    
    // DEĞİŞİKLİK: Merdiven mesafesi bilgisini kaldırdık
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'route-summary';
    summaryDiv.innerHTML = `
        <h3>${accessibleRoute ? 'Erişilebilir Rota Özeti' : 'Rota Özeti'}</h3>
        <p><strong>Toplam Mesafe:</strong> ${formattedDistance}</p>
        <p><strong>Tahmini Süre:</strong> ${formattedDuration}</p>
        <p><strong>Başlangıç:</strong> ${route.legs[0].start_address}</p>
        <p><strong>Varış:</strong> ${route.legs[route.legs.length-1].end_address}</p>
        ${accessibleRoute ? 
            `<p><strong>Erişilebilirlik Noktaları:</strong> 
                ${rampCount > 0 ? `Rampa: ${rampCount}` : ''}
                ${elevatorCount > 0 ? `${rampCount > 0 ? ', ' : ''}Asansör: ${elevatorCount}` : ''}
                ${rampCount === 0 && elevatorCount === 0 ? 'Yok' : ''}
            </p>` : ''}
        ${accessibleRoute && stairsCount > 0 ? 
            `<p class="stairs-warning"><strong>Dikkat:</strong> Haritada ${stairsCount} adet merdiven işaretlenmiştir. 
            Bu rota, merdivenleri içermemektedir.</p>` : ''}
    `;
    
    // Directions panel içeriğini temizle ve özeti ekle
    const directionsPanel = document.getElementById('directions-panel');
    directionsPanel.innerHTML = '';
    directionsPanel.appendChild(summaryDiv);
    
    // Adım adım yönergeleri ekle
    const stepsList = document.createElement('ol');
    stepsList.className = 'steps-list';
    
    route.legs.forEach((leg, legIndex) => {
        if (legIndex > 0 && accessibleRoute) {
            // Ara noktayı vurgula
            const waypointStep = document.createElement('li');
            waypointStep.className = 'waypoint-step';
            waypointStep.innerHTML = `<strong>Erişilebilirlik Noktası ${legIndex}</strong> üzerinden geçiliyor`;
            stepsList.appendChild(waypointStep);
        }
        
        leg.steps.forEach(step => {
            const stepItem = document.createElement('li');
            stepItem.innerHTML = step.instructions;
            stepsList.appendChild(stepItem);
        });
    });
    
    directionsPanel.appendChild(stepsList);
}

// Sayfa fonksiyonlarını global olarak eriştir (info window'da kullanmak için)
window.deleteAccessibilityPoint = deleteAccessibilityPoint;