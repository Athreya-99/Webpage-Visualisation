// medicine-heatmap.js

document.addEventListener("DOMContentLoaded", function() {
  // Get query params from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patient');
  const medicine = urlParams.get('medicine');
  const imgEl = document.getElementById('medicine-heatmap-img');

  if (!patientId || !medicine) {
    imgEl.alt = "Missing patient or medicine info";
    imgEl.src = "";
    return;
  }

  // Build the API url
  const apiUrl = `http://localhost:5000/api/medicine-heatmap?patient=${encodeURIComponent(patientId)}&medicine=${encodeURIComponent(medicine)}`;
  imgEl.src = apiUrl;
  imgEl.alt = `Medicine heatmap for ${medicine}`;
});
