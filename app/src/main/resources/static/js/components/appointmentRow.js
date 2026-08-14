// appointmentRow.js

export function createAppointmentRow(appointment) {
  const row = document.createElement("tr");

  const dateCell = document.createElement("td");
  dateCell.textContent = appointment.appointmentDate || appointment.date;

  const doctorCell = document.createElement("td");
  doctorCell.textContent = appointment.doctorName;

  const statusCell = document.createElement("td");
  statusCell.textContent = appointment.status;

  const actionCell = document.createElement("td");
  const viewPrescriptionBtn = document.createElement("button");
  viewPrescriptionBtn.className = "btn-secondary";
  viewPrescriptionBtn.textContent = "View Prescription";

  viewPrescriptionBtn.addEventListener("click", () => {
    // Corrected reference to use appointment's patient info or appointment ID
    const targetPatientId = appointment.patientId || appointment.id;
    window.location.href = `addPrescription.html?appointmentId=${appointment.id}&patientId=${targetPatientId}&mode=view`;
  });

  actionCell.appendChild(viewPrescriptionBtn);

  row.appendChild(dateCell);
  row.appendChild(doctorCell);
  row.appendChild(statusCell);
  row.appendChild(actionCell);

  return row;
}