// Puan hesaplama
function calculatePoints(type, weight) {
  const rates = {
    plastic: 1.2,    // Plastik: 1.2 puan/kg
    paper: 0.8,      // Kağıt: 0.8 puan/kg
    metal: 1.5,      // Metal: 1.5 puan/kg
    glass: 1.0,      // Cam: 1.0 puan/kg
    organic: 0.5,    // Organik: 0.5 puan/kg
    electronic: 2.0  // Elektronik: 2.0 puan/kg
  };
  
  return (rates[type] || 0) * weight;
}

// Atık türünü Türkçeye çevir
function getTurkishName(type) {
  const types = {
    plastic: "Plastik",
    paper: "Kağıt",
    metal: "Metal",
    glass: "Cam",
    organic: "Organik",
    electronic: "Elektronik"
  };
  
  return types[type] || type;
}

// Kullanıcı bilgilerini güncelle
function updateUserInStorage(user) {
  if (!user) return false;
  
  // Kullanıcı listesini güncelle
  let users = [];
  try {
    const usersJSON = localStorage.getItem("users");
    if (usersJSON) {
      users = JSON.parse(usersJSON);
      if (!Array.isArray(users)) {
        console.error("Kullanıcı verileri dizi değil, sıfırlanıyor");
        users = [];
      }
    }
  } catch (error) {
    console.error("Kullanıcıları okuma hatası:", error);
    users = [];
  }
  
  // Kullanıcıyı güncelle
  let updated = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === user.username) {
      users[i] = { ...user };
      updated = true;
      break;
    }
  }
  
  // Eğer kullanıcı bulunamadıysa ekle
  if (!updated) {
    users.push({ ...user });
  }
  
  // LocalStorage'ı güncelle
  try {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Kullanıcı kaydetme hatası:", error);
    return false;
  }
}

// Atık için ikon belirle
function getWasteIcon(type) {
  const icons = {
    plastic: '<i class="fas fa-wine-bottle"></i>',
    paper: '<i class="fas fa-newspaper"></i>',
    metal: '<i class="fas fa-box"></i>',
    glass: '<i class="fas fa-glass-martini-alt"></i>',
    organic: '<i class="fas fa-apple-alt"></i>',
    electronic: '<i class="fas fa-mobile-alt"></i>'
  };
  
  return icons[type] || '<i class="fas fa-trash"></i>';
}

// Atık için renk belirle
function getWasteColor(type) {
  const colors = {
    plastic: "#3498db",
    paper: "#f1c40f",
    metal: "#95a5a6",
    glass: "#1abc9c",
    organic: "#2ecc71",
    electronic: "#e74c3c"
  };
  
  return colors[type] || "#34495e";
}

// Tarih formatla
function formatDate(date) {
  if (!date) return "";
  
  if (typeof date === 'string') {
    return date;
  }
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString();
  } catch (error) {
    console.error("Tarih formatlama hatası:", error);
    return "";
  }
}

// LocalStorage'ı kontrol et
function checkLocalStorage() {
  try {
    const testItem = '__test__';
    localStorage.setItem(testItem, testItem);
    localStorage.removeItem(testItem);
    return true;
  } catch (e) {
    return false;
  }
}

// Toast mesajı göster
function showToast(message, duration = 3000) {
  // Eğer zaten bir toast varsa, kaldır
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }
  
  // Yeni toast oluştur
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Toast'ı görünür yap
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
  
  // Toast'ı otomatik kaldır
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Kullanılabilecek diğer yardımcı fonksiyonlar
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function roundNumber(number, decimals = 1) {
  if (isNaN(number)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

function getTotalWasteWeight(wasteHistory) {
  if (!wasteHistory || !Array.isArray(wasteHistory)) return 0;
  
  return wasteHistory.reduce((total, waste) => {
    return total + (parseFloat(waste.weight) || 0);
  }, 0);
}

function getTotalWastePoints(wasteHistory) {
  if (!wasteHistory || !Array.isArray(wasteHistory)) return 0;
  
  return wasteHistory.reduce((total, waste) => {
    return total + (parseFloat(waste.points) || 0);
  }, 0);
}

// Basit input validasyonu
function validateInput(value, type) {
  if (type === 'text') {
    return value && value.trim().length > 0;
  }
  
  if (type === 'number') {
    return !isNaN(parseFloat(value)) && parseFloat(value) > 0;
  }
  
  if (type === 'password') {
    return value && value.length >= 6;
  }
  
  return true;
}

// İki listeyi karşılaştırma
function compareArrays(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

// Hesaplama ve görüntüleme fonksiyonları
function calculateMoneyFromPoints(points) {
  return points / 10; // 10 puan = 1 TL
}

function formatMoney(amount) {
  return amount.toFixed(2) + ' ₺';
}

// LocalStorage temizleme fonksiyonu (geliştirme aşamasında kullanışlı)
function clearAllData() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Veri temizleme hatası:", error);
    return false;
  }
}

// Kullanıcı kontrol fonksiyonları
function isLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

function redirectIfNotLoggedIn(redirectTo = "index.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return true;
  }
  return false;
}

function getLoggedInUser() {
  try {
    const userJSON = localStorage.getItem("currentUser");
    if (!userJSON) return null;
    
    return JSON.parse(userJSON);
  } catch (error) {
    console.error("Kullanıcı okuma hatası:", error);
    return null;
  }
}

// Atık türüne göre toplam değerleri hesapla
function getWasteStatsByType(wasteHistory) {
  if (!wasteHistory || !Array.isArray(wasteHistory)) return {};
  
  const stats = {};
  
  for (const waste of wasteHistory) {
    const type = waste.type;
    if (!stats[type]) {
      stats[type] = {
        count: 0,
        weight: 0,
        points: 0
      };
    }
    
    stats[type].count++;
    stats[type].weight += parseFloat(waste.weight) || 0;
    stats[type].points += parseFloat(waste.points) || 0;
  }
  
  return stats;
}

// Tarih bilgisi analizleri
function getLastActivityDate(wasteHistory) {
  if (!wasteHistory || !Array.isArray(wasteHistory) || wasteHistory.length === 0) {
    return null;
  }
  
  let lastDate = null;
  
  for (const waste of wasteHistory) {
    if (waste.date) {
      const wasteDate = new Date(waste.date);
      if (!lastDate || wasteDate > lastDate) {
        lastDate = wasteDate;
      }
    }
  }
  
  return lastDate;
}

// Ay bazında atık dağılımını hesapla
function getWasteStatsByMonth(wasteHistory) {
  if (!wasteHistory || !Array.isArray(wasteHistory)) return {};
  
  const monthlyStats = {};
  
  for (const waste of wasteHistory) {
    if (!waste.date) continue;
    
    // Tarih formatı: 'YYYY-MM'
    const date = new Date(waste.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = {
        totalWeight: 0,
        totalPoints: 0,
        types: {}
      };
    }
    
    // Toplam değerleri güncelle
    monthlyStats[monthKey].totalWeight += parseFloat(waste.weight) || 0;
    monthlyStats[monthKey].totalPoints += parseFloat(waste.points) || 0;
    
    // Tür bazında değerleri güncelle
    if (!monthlyStats[monthKey].types[waste.type]) {
      monthlyStats[monthKey].types[waste.type] = {
        weight: 0,
        points: 0
      };
    }
    
    monthlyStats[monthKey].types[waste.type].weight += parseFloat(waste.weight) || 0;
    monthlyStats[monthKey].types[waste.type].points += parseFloat(waste.points) || 0;
  }
  
  return monthlyStats;
}

// LocalStorage boyutunu kontrol et (sınır: ~5MB)
function getLocalStorageSize() {
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    totalSize += (key.length + value.length) * 2; // UTF-16 karakter boyutu (2 byte)
  }
  
  return {
    bytes: totalSize,
    kilobytes: totalSize / 1024,
    megabytes: totalSize / (1024 * 1024),
    percentageUsed: (totalSize / (5 * 1024 * 1024)) * 100 // 5MB varsayılan sınıra göre
  };
}

// Atık geçmişi verileri için performans optimizasyonu
function optimizeWasteHistory(user) {
  if (!user || !user.wasteHistory || !Array.isArray(user.wasteHistory)) return user;
  
  // Çok büyük bir geçmiş varsa (100+ kayıt), en eski kayıtları birleştir
  if (user.wasteHistory.length > 100) {
    // Geçmişi tarihe göre sırala (eskiden yeniye)
    const sortedHistory = [...user.wasteHistory].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    // İlk 50 kaydı birleştir (tür bazında)
    const oldestEntries = sortedHistory.slice(0, 50);
    const newestEntries = sortedHistory.slice(50);
    
    // Tür bazında birleştirme
    const consolidatedEntries = {};
    
    for (const entry of oldestEntries) {
      if (!consolidatedEntries[entry.type]) {
        consolidatedEntries[entry.type] = {
          type: entry.type,
          typeName: entry.typeName || getTurkishName(entry.type),
          weight: 0,
          points: 0,
          date: "Birleştirilmiş Kayıt"
        };
      }
      
      consolidatedEntries[entry.type].weight += parseFloat(entry.weight) || 0;
      consolidatedEntries[entry.type].points += parseFloat(entry.points) || 0;
    }
    
    // Yeni geçmiş: birleştirilmiş + yeni kayıtlar
    user.wasteHistory = [...Object.values(consolidatedEntries), ...newestEntries];
  }
  
  return user;
}