
// DOM Elemanlarını Seçme
const bulb = document.getElementById('bulb');
const lightEffect = document.querySelector('.light-effect');
const lightReflection = document.getElementById('light-reflection');
const currentTimeElement = document.getElementById('current-time');
const brightnessElement = document.getElementById('brightness');
const brightnessBar = document.getElementById('brightness-bar');
const statusElement = document.getElementById('status');

// Saat kaydırıcısı elemanları
const hourSlider = document.getElementById('hour-slider');
const selectedHourElement = document.getElementById('selected-hour');

// Saate göre parlaklık hesaplama
function calculateBrightness(hour) {
    if (hour >= 8 && hour < 17) {
        return { brightness: 0, status: "Gündüz Modu (Kapalı)" };
    } else if ((hour >= 17 && hour < 23) || (hour >= 5 && hour < 8)) {
        return { brightness: 100, status: "Akşam/Sabah Modu" }; // Yüksek aktivite saatleri
    } else {
        return { brightness: 70, status: "Gece Geç Modu" }; // Düşük aktivite saatleri
    }
}

// Lambayı güncelleme
function updateLamp(hour) {
    // Saati formatla
    const formattedTime = `${hour}:00`;
    currentTimeElement.textContent = formattedTime;
    
    // Parlaklık hesapla
    const { brightness, status } = calculateBrightness(hour);
    
    // Parlaklık ve durum bilgisini güncelle
    brightnessElement.textContent = `${brightness}%`;
    brightnessBar.style.width = `${brightness}%`;
    statusElement.textContent = status;
    
    // Lambayı güncelle - daha gösterişli geçiş efekti
    if (brightness > 0) {
        bulb.style.filter = `brightness(${brightness/100})`;
        lightEffect.style.opacity = brightness/100;
        lightReflection.style.opacity = brightness/100;
        
        // Parlaklığa göre renk tonunu ayarla
        const hue = Math.min(60, 50 + brightness/5); // 50-60 arası sarı tonu
        bulb.style.background = `radial-gradient(circle, 
                                hsl(${hue}, 100%, 80%) 30%, 
                                hsl(${hue}, 100%, 50%) 70%)`;
        
        // Parlaklık değiştikçe efekt boyutunu değiştir
        const scale = 0.8 + (brightness / 100) * 0.4;
        lightEffect.style.transform = `scale(${scale})`;
    } else {
        bulb.style.filter = `brightness(0)`;
        lightEffect.style.opacity = 0;
        lightReflection.style.opacity = 0;
    }
    
    // Gece/gündüz görünümünü güncelle
    updateTimeOfDay(hour);
}

// Gece/gündüz görsel değişimi
function updateTimeOfDay(hour) {
    const body = document.querySelector('.city-background');
    const isNight = hour >= 17 || hour < 8;
    
    if (isNight) {
        body.style.background = 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
        document.querySelector('.stars').style.opacity = '1';
        // Gece sahnesinde lamba daha belirgin görünsün
        if (hour >= 22 || hour < 5) {
            document.querySelector('.scene').style.background = 'linear-gradient(to bottom, rgba(5, 10, 15, 0.95) 0%, rgba(10, 15, 20, 0.9) 100%)';
        } else {
            document.querySelector('.scene').style.background = 'linear-gradient(to bottom, rgba(10, 20, 30, 0.8) 0%, rgba(20, 30, 40, 0.7) 100%)';
        }
    } else {
        body.style.background = 'linear-gradient(to bottom, #2980b9, #6dd5fa, #ffffff)';
        document.querySelector('.stars').style.opacity = '0';
        document.querySelector('.scene').style.background = 'linear-gradient(to bottom, rgba(100, 150, 200, 0.3) 0%, rgba(80, 120, 160, 0.2) 100%)';
    }
}

// Gerçek saati almak için
function getCurrentTime() {
    const now = new Date();
    return now.getHours();
}

// Sayfa yüklenince animasyonları başlat
function initializeAnimations() {
    // Kartları sırayla göster
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });
}

// Saat kaydırıcısı için olay dinleyicisi
hourSlider.addEventListener('input', function() {
    const hour = parseInt(this.value);
    selectedHourElement.textContent = hour;
    updateLamp(hour);
});

// Sayfa yüklenince başlat
document.addEventListener('DOMContentLoaded', function() {
    // Kartların başlangıç stilini ayarla
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Başlangıçta mevcut saati al
    const currentHour = getCurrentTime();
    
    // Saat kaydırıcısını mevcut saate ayarla
    hourSlider.value = currentHour;
    selectedHourElement.textContent = currentHour;
    
    // Lambayı güncelle
    updateLamp(currentHour);
    
    // Animasyonları başlat
    setTimeout(initializeAnimations, 500);
});