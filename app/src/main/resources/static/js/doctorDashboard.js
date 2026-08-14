import { getAllAppointments } from "/js/services/appointmentRecordService.js";
import { createPatientRow } from "/js/components/patientRows.js";

const patientTableBody = document.getElementById("patientTableBody");
let selectedDate = new Date().toISOString().split("T")[0];
const token = localStorage.getItem("token");
let patientName = null;

// Search bar input listener
const searchBar = document.getElementById("searchBar");
if (searchBar) {
    searchBar.addEventListener("input", () => {
        const value = searchBar.value.trim();
        patientName = value !== "" ? value : null;
        loadAppointments();
    });
}

// "Today" button click listener
const todayButton = document.getElementById("todayButton");
if (todayButton) {
    todayButton.addEventListener("click", () => {
        selectedDate = new Date().toISOString().split("T")[0];

        const datePicker = document.getElementById("datePicker");
        if (datePicker) datePicker.value = selectedDate;

        loadAppointments();
    });
}

// Date picker change listener
const datePicker = document.getElementById("datePicker");
if (datePicker) {
    datePicker.value = selectedDate;

    datePicker.addEventListener("change", () => {
        selectedDate = datePicker.value;
        loadAppointments();
    });
}

// Function to fetch and display appointments
async function loadAppointments() {
    try {
        const appointments = await getAllAppointments(selectedDate, patientName, token);

        patientTableBody.innerHTML = "";

        if (!appointments || appointments.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="5" class="noPatientRecord">No Appointments found for selected date.</td>`;
            patientTableBody.appendChild(row);
            return;
        }

        appointments.forEach((appointment) => {
            // Read flat DTO properties with defensive fallbacks for nested objects
            const patient = {
                id: appointment.patientId || appointment.patient?.id || "N/A",
                name: appointment.patientName || appointment.patient?.name || "N/A",
                phone: appointment.patientPhone || appointment.patient?.phone || "N/A",
                email: appointment.patientEmail || appointment.patient?.email || "N/A",
            };

            const row = createPatientRow(patient, appointment);
            patientTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading appointments:", error);
        patientTableBody.innerHTML = "";
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" class="noPatientRecord">Error loading appointments. Try again later.</td>`;
        patientTableBody.appendChild(row);
    }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    loadAppointments();
});

// Single DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", () => {
    if (typeof renderContent === "function") {
        renderContent();
    }
    loadAppointments();
});