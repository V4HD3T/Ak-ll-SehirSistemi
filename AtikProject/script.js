const contentsElem = document.getElementById('contents');
const electromagnetElem = document.getElementById('electromagnet');
const toggleMagnetBtn = document.getElementById('toggle-magnet');
const toggleFerrousBtn = document.getElementById('toggle-ferrous');
const toggleAluminumBtn = document.getElementById('toggle-aluminum');
const sensorValueElem = document.getElementById('sensor-value');
const magnetOnPressureElem = document.getElementById('magnet-on-pressure');
const calculatedMetalElem = document.getElementById('calculated-metal');
const ferrousWeightElem = document.getElementById('ferrous-weight');
const aluminumWeightElem = document.getElementById('aluminum-weight');

let magnetActive = false;
let showFerrousWeight = false;
let showAluminumWeight = false;

toggleMagnetBtn.addEventListener('click', () => {
    magnetActive = !magnetActive;

    if (magnetActive) {
        electromagnetElem.classList.add('active');
        electromagnetElem.textContent = 'Elektromıknatıs AÇIK';
        toggleMagnetBtn.textContent = 'Kapat';
        toggleMagnetBtn.className = 'btn btn-green';

        contentsElem.style.transform = 'translateY(25px)';
        sensorValueElem.textContent = '1350';
        magnetOnPressureElem.textContent = '1350';
        calculatedMetalElem.textContent = '350';
    } else {
        electromagnetElem.classList.remove('active');
        electromagnetElem.textContent = 'Elektromıknatıs KAPALI';
        toggleMagnetBtn.textContent = 'Aç';
        toggleMagnetBtn.className = 'btn btn-gray';

        contentsElem.style.transform = 'translateY(0)';
        sensorValueElem.textContent = '1000';
        magnetOnPressureElem.textContent = '1000';
        calculatedMetalElem.textContent = '?';
    }
});

toggleFerrousBtn.addEventListener('click', () => {
    showFerrousWeight = !showFerrousWeight;
    ferrousWeightElem.style.display = showFerrousWeight ? 'block' : 'none';
    toggleFerrousBtn.textContent = showFerrousWeight ? 'Ferromanyetik Gizle' : 'Ferromanyetik Göster';
});

toggleAluminumBtn.addEventListener('click', () => {
    showAluminumWeight = !showAluminumWeight;
    aluminumWeightElem.style.display = showAluminumWeight ? 'block' : 'none';
    toggleAluminumBtn.textContent = showAluminumWeight ? 'Alüminyum Gizle' : 'Alüminyum Göster';
});
