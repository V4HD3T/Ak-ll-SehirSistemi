document.addEventListener("DOMContentLoaded", function() {
    // Form elemanları
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    // Link elemanları
    const toRegisterLink = document.getElementById("toRegisterLink");
    const toLoginLink = document.getElementById("toLoginLink");
    
    // Butonlar
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    
    // URL parametresine göre formu göster
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('form') === 'register') {
      showRegisterForm();
    } else {
      showLoginForm();
    }
    
    // Kayıt formunu göster
    function showRegisterForm() {
      loginForm.classList.add("slide-out-left");
      
      setTimeout(() => {
        loginForm.classList.add("hidden");
        loginForm.classList.remove("slide-out-left");
        
        registerForm.classList.remove("hidden");
        registerForm.classList.add("slide-in-right");
        
        setTimeout(() => {
          registerForm.classList.remove("slide-in-right");
        }, 500);
      }, 400);
    }
    
    // Giriş formunu göster
    function showLoginForm() {
      registerForm.classList.add("slide-out-right");
      
      setTimeout(() => {
        registerForm.classList.add("hidden");
        registerForm.classList.remove("slide-out-right");
        
        loginForm.classList.remove("hidden");
        loginForm.classList.add("slide-in-left");
        
        setTimeout(() => {
          loginForm.classList.remove("slide-in-left");
        }, 500);
      }, 400);
    }
    
    // Formlar arası geçiş için event listener'lar
    toRegisterLink.addEventListener("click", function(e) {
      e.preventDefault();
      history.pushState(null, '', '?form=register');
      showRegisterForm();
    });
    
    toLoginLink.addEventListener("click", function(e) {
      e.preventDefault();
      history.pushState(null, '', '?form=login');
      showLoginForm();
    });
    
    // Giriş işlemi
    loginBtn.addEventListener("click", function() {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      
      if (!username || !password) {
        showToast("Lütfen kullanıcı adı ve şifrenizi girin!");
        return;
      }
      
      // LocalStorage'dan kullanıcıları al
      let users = [];
      try {
        const usersJSON = localStorage.getItem("users");
        if (usersJSON) {
          users = JSON.parse(usersJSON);
          if (!Array.isArray(users)) {
            console.error("users bir dizi değil:", users);
            users = [];
          }
        }
      } catch (error) {
        console.error("Kullanıcıları okuma hatası:", error);
        users = [];
      }
      
      // Kullanıcıyı bul
      let userFound = false;
      let currentUser = null;
      
      for (let i = 0; i < users.length; i++) {
        if (users[i].username === username && users[i].password === password) {
          userFound = true;
          currentUser = users[i];
          break;
        }
      }
      
      if (userFound && currentUser) {
        // Giriş başarılı animasyonu
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Giriş Başarılı';
        loginBtn.classList.add("btn-success");
        
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        // Hata animasyonu
        loginBtn.innerHTML = '<i class="fas fa-times"></i> Hatalı Giriş';
        loginBtn.classList.add("btn-error");
        
        setTimeout(() => {
          loginBtn.innerHTML = 'Giriş Yap';
          loginBtn.classList.remove("btn-error");
        }, 1500);
        
        showToast("Kullanıcı adı veya şifre hatalı!");
      }
    });
    
    // Kayıt işlemi
    registerBtn.addEventListener("click", function() {
      const username = document.getElementById("registerUsername").value.trim();
      const password = document.getElementById("registerPassword").value.trim();
      
      if (!username || !password) {
        showToast("Lütfen tüm alanları doldurun!");
        return;
      }
      
      if (username.length < 3) {
        showToast("Kullanıcı adı en az 3 karakter olmalıdır!");
        return;
      }
      
      if (password.length < 6) {
        showToast("Şifre en az 6 karakter olmalıdır!");
        return;
      }
      
      // LocalStorage'dan kullanıcıları al
      let users = [];
      try {
        const usersJSON = localStorage.getItem("users");
        if (usersJSON) {
          users = JSON.parse(usersJSON);
          if (!Array.isArray(users)) {
            console.error("users bir dizi değil:", users);
            users = [];
          }
        }
      } catch (error) {
        console.error("Kullanıcıları okuma hatası:", error);
        users = [];
      }
      
      // Kullanıcı adı kontrolü
      let userExists = false;
      
      for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
          userExists = true;
          break;
        }
      }
      
      if (userExists) {
        showToast("Bu kullanıcı adı zaten kullanılıyor!");
        return;
      }
      
      // Yeni kullanıcı oluştur
      const newUser = {
        username: username,
        password: password,
        points: 0,
        money: 0,
        wasteHistory: []
      };
      
      // Kullanıcıyı kaydet
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Başarılı animasyonu
      registerBtn.innerHTML = '<i class="fas fa-check"></i> Kayıt Başarılı';
      registerBtn.classList.add("btn-success");
      
      setTimeout(() => {
        // Formu temizle
        document.getElementById("registerUsername").value = "";
        document.getElementById("registerPassword").value = "";
        
        // Giriş formuna yönlendir
        history.pushState(null, '', '?form=login');
        showLoginForm();
        
        // Toast mesajı
        showToast("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        
        // Buton durumunu sıfırla
        registerBtn.innerHTML = 'Kayıt Ol';
        registerBtn.classList.remove("btn-success");
      }, 1500);
    });
    
    // Enter tuşuyla form gönderme
    document.getElementById("loginUsername").addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        document.getElementById("loginPassword").focus();
      }
    });
    
    document.getElementById("loginPassword").addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        loginBtn.click();
      }
    });
    
    document.getElementById("registerUsername").addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        document.getElementById("registerPassword").focus();
      }
    });
    
    document.getElementById("registerPassword").addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        registerBtn.click();
      }
    });
  });