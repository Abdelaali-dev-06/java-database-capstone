// doctorDashboard.js

import { getAllAppointments } from "../services/appointmentServices.js";
import { createPatientRow } from "../components/patientRow.js";

// Get the table body where patient rows will be added
const patientTableBody = document.getElementById("patientTableBody");

// Initialize selectedDate with today's date in 'YYYY-MM-DD' format
let selectedDate = new Date().toISOString().split("T")[0];

// Get the saved token from localStorage
const token = localStorage.getItem("token");

// Initialize patientName to null
let patientName = null;

// Add an 'input' event listener to the search bar
const searchBar = document.getElementById("searchBar");
if (searchBar) {
    searchBar.addEventListener("input", () => {
        const value = searchBar.value.trim();

        if (value !== "") {
            patientName = value;
        } else {
            patientName = "null";
        }

        loadAppointments();
    });
}

// Add a click listener to the "Today" button
const todayButton = document.getElementById("todayButton");
if (todayButton) {
    todayButton.addEventListener("click", () => {
        selectedDate = new Date().toISOString().split("T")[0];

        const datePicker = document.getElementById("datePicker");
        if (datePicker) datePicker.value = selectedDate;

        loadAppointments();
    });
}

// Add a change event listener to the date picker
const datePicker = document.getElementById("datePicker");
if (datePicker) {
    datePicker.addEventListener("change", () => {
        selectedDate = datePicker.value;
        loadAppointments();
    });
}

// Function: loadAppointments
// Purpose: Fetch and display appointments based on selected date and optional patient name
async function loadAppointments() {
    try {
        // Step 1: Call getAllAppointments with selectedDate, patientName, and token
        const appointments = await getAllAppointments(selectedDate, patientName, token);

        // Step 2: Clear the table body content before rendering new rows
        patientTableBody.innerHTML = "";

        // Step 3: If no appointments are returned
        if (!appointments || appointments.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="5" class="noPatientRecord">No Appointments found for today.</td>`;
            patientTableBody.appendChild(row);
            return;
        }

        // Step 4: If appointments exist, loop through and build patient objects
        appointments.forEach((appointment) => {
            const patient = {
                id: appointment.patientId,
                name: appointment.patientName,
                phone: appointment.patientPhone,
                email: appointment.patientEmail,
            };

            const row = createPatientRow(patient, appointment);
            patientTableBody.appendChild(row);
        });
    } catch (error) {
        // Step 5: Catch and handle any errors during fetch
        console.error("Error loading appointments:", error);
        patientTableBody.innerHTML = "";
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" class="noPatientRecord">Error loading appointments. Try again later.</td>`;
        patientTableBody.appendChild(row);
    }
}

// When the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    renderContent();
    loadAppointments();
});