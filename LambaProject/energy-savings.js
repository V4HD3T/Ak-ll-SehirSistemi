// Enerji tasarrufu sayfası için JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Yükleme animasyonları
    function animatePageLoad() {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, 200 * index);
        });
    }
    
    // Sayfa yükleme animasyonunu başlat
    animatePageLoad();
    
    // Kart animasyonları
    function animateCards() {
        const cards = document.querySelectorAll('.data-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 * index);
        });
    }
    
    // Kartların başlangıç stilini ayarla
    const cards = document.querySelectorAll('.data-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    
    // Kart animasyonlarını başlat
    setTimeout(animateCards, 800);
    
    // --- Birikimli Tasarruf Zaman Çizelgesi Kodları ---
    
    // Kaydırıcı elemanları
    const yearSlider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');
    const savingsAmount = document.getElementById('savings-amount');
    
    // Etkileşim göstergeleri
    const hospitalsCount = document.getElementById('hospitals-count');
    const schoolsCount = document.getElementById('schools-count');
    const roadsCount = document.getElementById('roads-count');
    
    // Yıllık tasarruf (milyar TL)
    const annualSavings = 2.95;
    
    // Farklı kamu hizmetleri için yaklaşık maliyetler
    const hospitalCost = 0.15; // milyar TL
    const schoolCost = 0.05;   // milyar TL
    const roadCost = 0.03;     // milyar TL/km
    
    // Değerleri animasyonla güncelleme fonksiyonu
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const formatter = new Intl.NumberFormat('tr-TR');
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            
            if (element.id === 'savings-amount') {
                element.textContent = `₺${formatter.format(currentValue.toFixed(2))} Milyar`;
            } else {
                element.textContent = formatter.format(currentValue);
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Animasyon bittiğinde parlama efekti ekle
                element.classList.add('highlight-animation');
                setTimeout(() => {
                    element.classList.remove('highlight-animation');
                }, 1500);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Başlangıç değerlerini ayarlama ve kaydırıcıyı doğru pozisyona getirme
    function updateSliderVisually() {
        // Mevcut yıl değerini al (HTML'den)
        let currentYear = parseInt(yearDisplay.textContent);
        if (isNaN(currentYear)) currentYear = 6; // Varsayılan değer
        
        // Kaydırıcıyı bu değere ayarla
        yearSlider.value = currentYear;
        
        // Tüm değerleri hesapla ve görselleştir (animasyonsuz, direkt gösterim)
        const cumulativeSavings = annualSavings * currentYear;
        const hospitals = Math.floor(cumulativeSavings / hospitalCost);
        const schools = Math.floor(cumulativeSavings / schoolCost);
        const roads = Math.floor(cumulativeSavings / roadCost);
        
        // Değerleri ayarla (sayfa ilk yüklendiğinde animasyon olmadan)
        savingsAmount.textContent = `₺${new Intl.NumberFormat('tr-TR').format(cumulativeSavings.toFixed(2))} Milyar`;
        hospitalsCount.textContent = new Intl.NumberFormat('tr-TR').format(hospitals);
        schoolsCount.textContent = new Intl.NumberFormat('tr-TR').format(schools);
        roadsCount.textContent = new Intl.NumberFormat('tr-TR').format(roads);
    }
    
    // Kaydırıcı değiştiğinde güncelleme
    if (yearSlider) {
        // Sayfa yüklendiğinde kaydırıcıyı düzelt
        setTimeout(updateSliderVisually, 100);
        
        // Kullanıcı kaydırıcıyı değiştirdiğinde
        yearSlider.addEventListener('input', function() {
            const year = parseInt(this.value);
            const prevYear = parseInt(yearDisplay.textContent);
            yearDisplay.textContent = year;
            
            // Birikimli tasarruf hesaplama
            const cumulativeSavings = annualSavings * year;
            const prevSavings = annualSavings * prevYear;
            
            // Etki göstergeleri hesaplama
            const hospitals = Math.floor(cumulativeSavings / hospitalCost);
            const prevHospitals = Math.floor(prevSavings / hospitalCost);
            
            const schools = Math.floor(cumulativeSavings / schoolCost);
            const prevSchools = Math.floor(prevSavings / schoolCost);
            
            const roads = Math.floor(cumulativeSavings / roadCost);
            const prevRoads = Math.floor(prevSavings / roadCost);
            
            // Değerleri animasyonla güncelle
            animateValue(savingsAmount, prevSavings, cumulativeSavings, 800);
            animateValue(hospitalsCount, prevHospitals, hospitals, 800);
            animateValue(schoolsCount, prevSchools, schools, 800);
            animateValue(roadsCount, prevRoads, roads, 800);
        });
    }
    
    // Sayfa kaydırma animasyonu
    const sections = document.querySelectorAll('.glass-card');
    
    function checkScroll() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.8) {
                section.classList.add('fade-in-active');
            }
        });
    }
    
    // Sayfa açıldığında bir kez kontrol et
    checkScroll();
    
    // Sayfa kaydırılırken sürekli kontrol et
    window.addEventListener('scroll', checkScroll);
});