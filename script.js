// --- CONFIG: City icons (SVG as data URLs or from /icons/ folder) ---
const cityIcons = {
  "Delhi": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3db.svg",         // Government building (Parliament/Capitol)
  "Mumbai": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e3.svg",        // Cityscape (Mumbai skyline)
  "Bangalore": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e2.svg",     // Office building (Tech hub)
  "Chennai": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e0.svg",       // House/building (Chennai architecture)
  "Kolkata": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ea.svg",       // Shop (Kolkata markets)
  "Hyderabad": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ef.svg",     // Castle (Charminar/Heritage)
  "Pune": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e4.svg",          // Post office (Historic Pune)
  "Ahmedabad": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e5.svg",     // Hospital (Gandhi Ashram/Institutes)
  "Jaipur": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ed.svg",        // Factory (Pink City/Industry)
  "Lucknow": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e8.svg",       // European castle (Imambara/Heritage)
  "Chandigarh": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e9.svg",    // Japanese castle (Planned city)
  "Goa": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d6.svg",           // Beach with umbrella
  "Bhubaneswar": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26ea.svg"     // Church (Temples/Heritage)
  // Add more cities and icons as needed
};


// --- Helper: Fetch JSON data ---
async function fetchData() {
  return fetch('patients_new.json').then(r => r.json());
}

async function fetchData() {
  const response = await fetch('patients_new.json');
  return await response.json();
}

async function renderCities() {
  const data = await fetchData();
  const cities = [...new Set(data.map(p => p.city).filter(Boolean))];
  const cityList = document.getElementById('city-list');
  cityList.innerHTML = '';
  cities.forEach(city => {
    const box = document.createElement('div');
    box.className = 'box';

    // Create and add the city icon
    const icon = document.createElement('img');
    icon.src = cityIcons[city] || 'default_icon.svg'; // Use a default icon if city not found
    icon.alt = city + " icon";
    icon.className = 'city-icon';
    box.appendChild(icon);

    // Add the city name label
    const label = document.createElement('span');
    label.textContent = city;
    label.style.marginTop = "8px";
    label.style.fontWeight = "600";
    box.appendChild(label);

    box.onclick = () => {
      localStorage.setItem('selectedCity', city);
      window.location.href = 'patients.html';
    };
    cityList.appendChild(box);
  });
}





// --- Render Patient List ---
async function renderPatients() {
  const city = localStorage.getItem('selectedCity');
  if (!city) { window.location.href = 'index.html'; return; }
  document.getElementById('city-name').textContent = city;
  const data = await fetchData();
  const patients = data.filter(p => p.city === city);
  const patientList = document.getElementById('patient-list');
  patientList.innerHTML = '';
  patients.forEach(patient => {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
      <span style="font-weight:600;font-size:1.15em;">${patient.name}</span>
      <span style="color:#6366f1;font-size:0.95em;margin-top:8px;">ID: ${patient._id}</span>
    `;
    card.onclick = () => {
      localStorage.setItem('selectedPatientId', patient._id);
      window.location.href = 'visualization.html';
    };

    patientList.appendChild(card);
  });
}

// --- Render Heatmap Visualization ---
function renderHeatmap() {
  const patientId = localStorage.getItem('selectedPatientId');
  if (!patientId) {
    document.getElementById('heatmap-img').alt = "No patient selected";
    return;
  }
  // Set the image src to the backend API
  document.getElementById('heatmap-img').src = `http://localhost:5000/api/heatmap?id=${encodeURIComponent(patientId)}`;
}


// --- Navigation helpers ---
function goBackToCities() {
  window.location.href = 'index.html';
}
function goBackToPatients() {
  window.location.href = 'patients.html';
}
