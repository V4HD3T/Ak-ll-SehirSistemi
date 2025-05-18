document.addEventListener("DOMContentLoaded", function() {
    // Kullanıcı kontrolü
    const currentUser = getLoggedInUser();
    
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    
    // Elementleri tanımla
    const userDisplay = document.getElementById("userDisplay");
    const userPoints = document.getElementById("userPoints");
    const userMoney = document.getElementById("userMoney");
    const totalWaste = document.getElementById("totalWaste");
    const wasteType = document.getElementById("wasteType");
    const wasteWeight = document.getElementById("wasteWeight");
    const addWasteBtn = document.getElementById("addWasteBtn");
    const historyList = document.getElementById("historyList");
    const logoutBtn = document.getElementById("logoutBtn");
    const historyFilter = document.getElementById("historyFilter");
    const chartPlaceholder = document.getElementById("chartPlaceholder");
    const wasteChart = document.getElementById("wasteChart");
    const leaderboardBody = document.getElementById("leaderboardBody");
    const randomTip = document.getElementById("randomTip");
    const newTipBtn = document.getElementById("newTipBtn");
    
    // Chart.js için grafik
    let pieChart = null;
    
    // Kullanıcı bilgilerini göster
    userDisplay.textContent = currentUser.username;
    
    // Dashboard'ı ilk kez güncelle
    updateDashboard();
    updateWasteChart();
    updateLeaderboard();
    showRandomTip();
    
    // Atık ekleme
    addWasteBtn.addEventListener("click", function() {
      const type = wasteType.value;
      const weight = parseFloat(wasteWeight.value);
      
      if (!type) {
        showToast("Lütfen bir atık türü seçin!");
        wasteType.focus();
        return;
      }
      
      if (isNaN(weight) || weight <= 0) {
        showToast("Lütfen geçerli bir ağırlık girin!");
        wasteWeight.focus();
        return;
      }
      
      // Atık ekle butonuna yükleniyor animasyonu
      addWasteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ekleniyor...';
      addWasteBtn.disabled = true;
      
      // Kısa bir gecikme ile işlem simülasyonu (gerçek uygulamada sunucu yanıtını bekleyebilir)
      setTimeout(() => {
        // Puan hesapla
        const points = calculatePoints(type, weight);
        
        // Yeni atık kaydı oluştur
        const newWaste = {
          type: type,
          typeName: getTurkishName(type),
          weight: weight,
          points: points,
          date: new Date().toLocaleDateString()
        };
        
        // Kullanıcı verilerini güncelle
        if (!currentUser.wasteHistory) {
          currentUser.wasteHistory = [];
        }
        
        currentUser.wasteHistory.push(newWaste);
        currentUser.points = (currentUser.points || 0) + points;
        currentUser.money = currentUser.points / 10; // 10 puan = 1 TL
        
        // LocalStorage güncelle
        updateUserInStorage(currentUser);
        
        // Formu temizle
        wasteType.value = "";
        wasteWeight.value = "";
        
        // Dashboard güncelle
        updateDashboard();
        updateWasteChart();
        updateLeaderboard();
        
        // Başarılı mesajı
        showToast("Atık başarıyla eklendi!");
        
        // Buton durumunu sıfırla
        addWasteBtn.innerHTML = '<i class="fas fa-plus"></i> Atık Ekle';
        addWasteBtn.disabled = false;
      }, 800);
    });
    
    // Atık geçmişi filtresi
    historyFilter.addEventListener("change", function() {
      updateHistoryList(historyFilter.value);
    });
    
    // Yeni çevre ipucu
    newTipBtn.addEventListener("click", function() {
      // Buton animasyonu
      newTipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
      newTipBtn.disabled = true;
      
      setTimeout(() => {
        showRandomTip();
        
        // Buton durumunu sıfırla
        newTipBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Yeni İpucu';
        newTipBtn.disabled = false;
      }, 400);
    });
    
    // Çıkış yap
    logoutBtn.addEventListener("click", function() {
      // Çıkış animasyonu
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Çıkış yapılıyor...';
      
      setTimeout(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      }, 800);
    });
    
    // DASHBOARD FONKSİYONLARI
    
    // Dashboard'ı güncelle
    function updateDashboard() {
      userPoints.textContent = (currentUser.points || 0).toFixed(1);
      userMoney.textContent = (currentUser.money || 0).toFixed(2);
      
      // Toplam atık miktarını hesapla
      let totalWasteAmount = 0;
      if (currentUser.wasteHistory && currentUser.wasteHistory.length > 0) {
        totalWasteAmount = currentUser.wasteHistory.reduce((total, waste) => total + parseFloat(waste.weight || 0), 0);
      }
      totalWaste.textContent = totalWasteAmount.toFixed(1);
      
      // Atık geçmişini güncelle
      updateHistoryList("all");
    }
    
    // Atık geçmişi listesini güncelle
    function updateHistoryList(filterType) {
      historyList.innerHTML = "";
      
      if (!currentUser.wasteHistory || currentUser.wasteHistory.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "Henüz atık eklenmemiş.";
        emptyMessage.className = "empty-list";
        historyList.appendChild(emptyMessage);
        return;
      }
      
      // Atıkları filtrele
      let filteredWaste = [...currentUser.wasteHistory].reverse();
      if (filterType !== "all") {
        filteredWaste = filteredWaste.filter(waste => waste.type === filterType);
        
        if (filteredWaste.length === 0) {
          const emptyMessage = document.createElement("li");
          emptyMessage.textContent = `${getTurkishName(filterType)} türünde atık bulunmamaktadır.`;
          emptyMessage.className = "empty-list";
          historyList.appendChild(emptyMessage);
          return;
        }
      }
      
      // Filtrelenmiş atıkları listele
      filteredWaste.forEach(waste => {
        const li = document.createElement("li");
        li.className = `waste-item waste-${waste.type}`;
        
        const icon = document.createElement("span");
        icon.className = "waste-icon";
        icon.innerHTML = getWasteIcon(waste.type);
        
        const info = document.createElement("span");
        info.className = "waste-info";
        info.innerHTML = `<strong>${waste.typeName}</strong> - ${waste.weight} kg - ${waste.points.toFixed(1)} puan`;
        
        const date = document.createElement("span");
        date.className = "waste-date";
        date.textContent = waste.date || "";
        
        li.appendChild(icon);
        li.appendChild(info);
        li.appendChild(date);
        
        historyList.appendChild(li);
      });
    }
    
    // Atık dağılımı grafiğini güncelle
    function updateWasteChart() {
      if (!currentUser.wasteHistory || currentUser.wasteHistory.length === 0) {
        chartPlaceholder.style.display = "flex";
        wasteChart.style.display = "none";
        return;
      }
      
      chartPlaceholder.style.display = "none";
      wasteChart.style.display = "block";
      
      // Atık türlerine göre dağılımı hesapla
      const wasteTypes = {};
      
      currentUser.wasteHistory.forEach(waste => {
        if (wasteTypes[waste.type]) {
          wasteTypes[waste.type] += parseFloat(waste.weight || 0);
        } else {
          wasteTypes[waste.type] = parseFloat(waste.weight || 0);
        }
      });
      
      // Grafik için verileri hazırla
      const labels = [];
      const data = [];
      const colors = [];
      
      for (const type in wasteTypes) {
        labels.push(`${getTurkishName(type)} (${wasteTypes[type].toFixed(1)} kg)`);
        data.push(wasteTypes[type]);
        colors.push(getWasteColor(type));
      }
      
      // Eğer zaten bir grafik varsa yok et
      if (pieChart) {
        pieChart.destroy();
      }
      
      // Yeni grafik oluştur
      const ctx = wasteChart.getContext('2d');
      pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.raw;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${percentage}%`;
                }
              }
            }
          }
        }
      });
    }
    
    // Liderlik tablosunu güncelle
    function updateLeaderboard() {
      leaderboardBody.innerHTML = "";
      
      // Tüm kullanıcıları al
      let users = [];
      try {
        const usersJSON = localStorage.getItem("users");
        if (usersJSON) {
          users = JSON.parse(usersJSON);
          if (!Array.isArray(users)) {
            users = [];
          }
        }
      } catch (error) {
        console.error("Kullanıcıları okuma hatası:", error);
        users = [];
      }
      
      if (users.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="3" class="empty-list">Henüz kullanıcı bulunmamaktadır.</td>`;
        leaderboardBody.appendChild(row);
        return;
      }
      
      // Puanlarına göre sırala
      users.sort((a, b) => (b.points || 0) - (a.points || 0));
      
      // İlk 5 kullanıcıyı göster
      const topUsers = users.slice(0, 5);
      
      topUsers.forEach((user, index) => {
        const row = document.createElement("tr");
        
        // Şu anki kullanıcıyı vurgula
        if (user.username === currentUser.username) {
          row.className = "current-user";
        }
        
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.username}</td>
          <td>${(user.points || 0).toFixed(1)}</td>
        `;
        
        leaderboardBody.appendChild(row);
      });
    }
    
    // Rastgele çevre ipucu göster
    function showRandomTip() {
      const tips = [
        "Plastik şişeleri geri dönüşüme atmadan önce sıkıştırarak hacimlerini azaltabilirsiniz.",
        "Elektronik atıklar, içerdikleri değerli metaller sayesinde geri dönüşüm için çok değerlidir.",
        "Kağıt geri dönüşümü, ağaç kesimini %30'a kadar azaltabilir.",
        "Cam atıklar, hiç kalite kaybı olmadan sınırsız kez geri dönüştürülebilir.",
        "Organik atıklarınızı kompost yaparak bahçeniz için doğal gübre elde edebilirsiniz.",
        "Plastik poşet yerine bez torba kullanmak, yılda ortalama 300 plastik poşet kullanımını engeller.",
        "Metal kutular, geri dönüştürüldüğünde %95 oranında enerji tasarrufu sağlar.",
        "Giysileri atmak yerine bağışlamak, tekstil atıklarını azaltmanın en iyi yollarından biridir.",
        "Piller ve elektronik atıklar, evsel atıklarla aynı yere atılmamalıdır.",
        "Bir ton kağıdın geri dönüşümü 17 ağacı kurtarır.",
        "Alışverişte tek kullanımlık ürünler yerine yeniden kullanılabilir alternatifleri tercih edin.",
        "Su tasarrufu için duş sürenizi 1 dakika kısaltmak, yılda 550 litre su tasarrufu sağlar.",
        "LED ampuller, geleneksel ampullere göre %80 daha az enerji tüketir ve 25 kat daha uzun ömürlüdür.",
        "Yiyecekleri dondurarak saklamak, gıda israfını önlemenin etkili bir yoludur."
      ];
      
      const randomIndex = Math.floor(Math.random() * tips.length);
      randomTip.innerHTML = `<i class="fas fa-lightbulb"></i> ${tips[randomIndex]}`;
      
      // Animasyon ekle
      randomTip.classList.add("tip-animation");
      setTimeout(() => {
        randomTip.classList.remove("tip-animation");
      }, 700);
    }
    
    // Kullanıcı oturum kontrolü
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
    
    // Toast bildirimi göster
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
  });