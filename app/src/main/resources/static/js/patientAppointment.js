// patientAppointment.js
import { getPatientAppointments, getPatientData, filterAppointments } from "./services/patientServices.js";

const tableBody = document.getElementById("patientTableBody");

let allAppointments = [];
let filteredAppointments = [];
let patientId = null;

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage.");
      return;
    }

    // Fetch the patient profile first to get the correct numeric ID using the token
    const patientRes = await getPatientData(token);
    if (!patientRes || patientRes.unauthorized || !patientRes.id) {
      console.error("Failed to retrieve valid patient data/ID from token.");
      return;
    }

    patientId = Number(patientRes.id);

    // Fetch all appointments immediately on page load
    const result = await getPatientAppointments(patientId, token, "patient");
    allAppointments = result.appointments || [];

    // Set default filter dropdown to "allAppointments" if it isn't already
    const filterElement = document.getElementById("appointmentFilter");
    if (filterElement && !filterElement.value) {
      filterElement.value = "allAppointments";
    }

    renderAppointments(allAppointments);
  } catch (error) {
    console.error("Error loading appointments:", error);
    alert("❌ Failed to load your appointments.");
  }
}

function renderAppointments(appointments) {
  tableBody.innerHTML = "";

  const actionTh = document.querySelector("#patientTable thead tr th:last-child");
  if (actionTh) {
    actionTh.style.display = "table-cell";
  }

  if (!appointments.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No Appointments Found</td></tr>`;
    return;
  }

  appointments.forEach(appointment => {
    const patientName = appointment.patientName || appointment.patient?.name || "You";
    const doctorName = appointment.doctorName || appointment.doctor?.name || appointment.doctor || "N/A";
    const appointmentDate = appointment.appointmentDate || appointment.date || "N/A";
    const appointmentTime = appointment.appointmentTimeOnly || appointment.time || appointment.appointmentTime || "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${patientName}</td>
      <td>${doctorName}</td>
      <td>${appointmentDate}</td>
      <td>${appointmentTime}</td>
      <td>${appointment.status == 0 ? `<img src="../assets/images/edit/edit.png" alt="Edit" class="prescription-btn" data-id="${appointment.patientId || patientId}">` : "-"}</td>
    `;

    if (appointment.status == 0) {
      const actionBtn = tr.querySelector(".prescription-btn");
      actionBtn?.addEventListener("click", () => redirectToUpdatePage(appointment));
    }

    tableBody.appendChild(tr);
  });
}

function redirectToUpdatePage(appointment) {
  const queryString = new URLSearchParams({
    appointmentId: appointment.id,
    patientId: appointment.patientId || patientId,
    patientName: appointment.patientName || "You",
    doctorName: appointment.doctorName || appointment.doctor?.name || "N/A",
    doctorId: appointment.doctorId || "",
    appointmentDate: appointment.appointmentDate || appointment.date || "",
    appointmentTime: appointment.appointmentTimeOnly || appointment.time || "",
  }).toString();

  setTimeout(() => {
    window.location.href = `/pages/updateAppointment.html?${queryString}`;
  }, 100);
}

// Search and Filter Listeners
document.getElementById("searchBar")?.addEventListener("input", handleFilterChange);
document.getElementById("appointmentFilter")?.addEventListener("change", handleFilterChange);

async function handleFilterChange() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const searchBarValue = document.getElementById("searchBar").value.trim();
  const filterValue = document.getElementById("appointmentFilter").value;

  const name = searchBarValue || null;

  // If "allAppointments" or empty is selected, bypass backend filter and show all cached appointments
  if (!filterValue || filterValue === "allAppointments" || filterValue === "All Appointments") {
    if (!name) {
      renderAppointments(allAppointments);
      return;
    }
  }

  const condition = (filterValue === "allAppointments" || filterValue === "All Appointments") ? null : filterValue;

  try {
    const response = await filterAppointments(condition, name, token);
    const appointments = response?.appointments || [];
    filteredAppointments = appointments;

    renderAppointments(filteredAppointments);
  } catch (error) {
    console.error("Failed to filter appointments:", error);
    alert("❌ An error occurred while filtering appointments.");
  }
}