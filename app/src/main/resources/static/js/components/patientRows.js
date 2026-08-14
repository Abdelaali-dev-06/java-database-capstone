// static/js/components/patientRows.js

export function createPatientRow(patient, appointment) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
        <td>${patient.id}</td>
        <td>${patient.name}</td>
        <td>${patient.phone}</td>
        <td>${patient.email}</td>
        <td>
            <img src="../assets/images/addPrescriptionIcon/addPrescription.png" 
                 class="prescription-icon" 
                 style="width: 32px; height: 32px; object-fit: contain; cursor: pointer;"
                 alt="Prescription"/>
        </td>
    `;

  const prescriptionIcon = tr.querySelector(".prescription-icon");

  if (prescriptionIcon) {
    prescriptionIcon.addEventListener("click", () => {
      const appointmentId = appointment.id || appointment.appointmentId;
      const patientId = patient.id || appointment.patientId;
      const patientName = encodeURIComponent(patient.name || "");

      if (!appointmentId) {
        alert("Error: Missing appointment ID.");
        return;
      }

      window.location.href = `/pages/addPrescription.html?appointmentId=${appointmentId}&patientId=${patientId}&patientName=${patientName}`;
    });
  }

  return tr;
}