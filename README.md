# 🔍 Akıllı Sistemler Proje Koleksiyonu

Bu repoda yer alan projeler, toplumsal fayda, enerji verimliliği ve erişilebilirlik temelli çözümler üretmeyi hedefleyen 3 özgün simülasyon ve prototip çalışmasını içermektedir. Her proje, farklı bir problemi çözen yenilikçi yaklaşımlar ve uygulanabilir teknolojilerle tasarlanmıştır.

---

## 📁 Proje 1: Akıllı Zaman Tabanlı Aydınlatma Simülasyonu

### 🎯 Problem Tanımı
Enerji israfı, otomasyon eksikliği ve zamanlayıcıların gerçek zamanla senkronize olmaması önemli sorunlardandır. Bu proje, günün saatine göre ışık seviyesini dinamik olarak ayarlayan bir sistem sunar.

### 💡 Çözüm
- Gerçek zamanlı saat verisine dayalı ışık seviyesi kontrolü
- Manuel etkileşim olmadan otomatik senaryo yürütme
- Cam panel (glassmorphism) tasarım ve sezgisel UI

### ⚙️ Teknik Özellikler
- HTML, CSS, JavaScript tabanlı prototipleme
- JS fonksiyonları: `calculateBrightness`, `getCurrentTime`
- Responsive arayüz ve 60 FPS animasyon desteği

### 🚀 Geliştirme Olanakları
- API entegrasyonu (hava durumu/saat)
- Gömülü sistemler ile donanımsal uygulama
- Kullanıcıya özel aydınlatma senaryoları (gece modu, sabah yoga vb.)

---

## 📁 Proje 2: Akıllı Elektromanyetik Geri Dönüşüm Sistemi

### 🎯 Problem Tanımı
Evsel atıklarda yer alan metalleri manuel ayıklamak zaman alıcı ve verimsizdir. Temassız ve akıllı bir ayrıştırma sistemi ihtiyacı doğmuştur.

### 💡 Çözüm
- Elektromıknatıs + Load Cell ile ferromanyetik ayrım
- Eddy Current ile alüminyum ve bakır tespiti
- Otonom, temassız, hata payı düşük ayrıştırma

### ⚙️ Teknik Özellikler
- Donanım: ESP32, elektromıknatıs, load cell, eddy akım sensörü
- Yazılım: Python & C++ tabanlı, modüler yapı
- Opsiyonel: OLED ekran, seri port görselleştirme

### 🚀 Geliştirme Olanakları
- IoT dashboard entegrasyonu
- ML tabanlı metal sınıflandırma
- Güneş enerjisi ile çalışma

---

## 📁 Proje 3: Engelsiz Harita – Erişilebilirlik Tabanlı Navigasyon Sistemi

### 🎯 Problem Tanımı
Yürüme engelli bireyler için merdivenler, uygun rampa eksikliği gibi fiziksel engeller ulaşımı zorlaştırmaktadır.

### 💡 Çözüm
- Rampa ve merdiven lokasyonlarının harita üzerinde işaretlenmesi
- Engelsiz rotaların otomatik oluşturulması
- Mevcut harita sistemlerine göre fiziksel engellerin önceden tespiti

### ⚙️ Teknik Özellikler
- Altyapı: OpenStreetMap + Leaflet.js
- Modüler, ölçeklenebilir frontend mimarisi
- Rampaya en yakın güzergah önerisi ve yüksek kontrast UI

### 🚀 Geliştirme Olanakları
- Sesli yönlendirme ve diğer engel türleri için modüller
- Harita verisinin toplulukla genişletilmesi
- Freemium model ile ticarileştirme

---

## 📂 Klasör Yapısı (Önerilen)

```plaintext
📦 AkilliSistemler
 ┣ 📁 aydinlatma-simulasyonu/
 ┃ ┣ 📜 index.html
 ┃ ┣ 📜 style.css
 ┃ ┗ 📜 script.js
 ┣ 📁 elektromanyetik-geri-donusum/
 ┃ ┣ 📜 main.ino
 ┃ ┣ 📜 eddy_sensor.py
 ┃ ┗ 📜 read_serial.py
 ┣ 📁 engelsiz-harita/
 ┃ ┣ 📜 map.html
 ┃ ┣ 📜 leaflet.js
 ┃ ┗ 📜 ramp-data.json
 ┗ 📜 README.md
