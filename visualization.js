function renderHeatmap() {
  const patientId = localStorage.getItem('selectedPatientId');
  const imgEl = document.getElementById('heatmap-img');
  if (!patientId) {
    imgEl.alt = "No patient selected";
    imgEl.src = "";
    return;
  }
  imgEl.src = `http://localhost:5000/api/heatmap?id=${encodeURIComponent(patientId)}`;
  imgEl.alt = "Patient Heatmap";
}

async function renderMedicineButtons() {
  console.log("renderMedicineButtons called");
  const patientId = localStorage.getItem('selectedPatientId');
  console.log("Selected patientId:", patientId);
  const panel = document.getElementById("medicine-buttons");
  panel.innerHTML = "";
  if (!patientId) return;
  try {
    const resp = await fetch(`http://localhost:5000/api/medicines?id=${encodeURIComponent(patientId)}`);
    const data = await resp.json();
    const medicines = data.medicines || [];
    console.log('API returned medicines:', medicines);
    if (medicines.length === 0) {
      panel.innerHTML = "<span style='color:#b91c1c;font-size:1.02em;'>No medicines found for this patient.</span>";
      return;
    }
    medicines.forEach(med => {
      const btn = document.createElement("a");
      btn.className = "medicine-btn";
      btn.textContent = med;
      btn.href = `/medicine-info.html?medicine=${encodeURIComponent(med)}`;
      panel.appendChild(btn);
    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    panel.innerHTML = "<span style='color:#b91c1c;font-size:1.02em;'>Failed to load medicines. Please try again.</span>";
  }
}


function goBackToPatients() {
  window.location.href = 'patients.html';
}

document.addEventListener("DOMContentLoaded", function() {
  renderHeatmap();
  renderMedicineButtons();
});
