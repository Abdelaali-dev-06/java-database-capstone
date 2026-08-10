// adminDashboard.js

import { createDoctorCard } from "../components/doctorCard.js";
import { openModal } from "../components/modal.js";
import { getDoctors, filterDoctors, saveDoctor } from "../services/doctorServices.js";

// Attach a click listener to the "Add Doctor" button
document.addEventListener("DOMContentLoaded", () => {
    const addDocBtn = document.getElementById("addDocBtn");
    if (addDocBtn) {
        addDocBtn.addEventListener("click", () => {
            openModal("addDoctor");
        });
    }

    // Call loadDoctorCards() to fetch and display all doctors
    loadDoctorCards();

    // Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
    const searchBar = document.getElementById("searchBar");
    const timeFilter = document.getElementById("timeFilter");
    const specialtyFilter = document.getElementById("specialtyFilter");

    if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
    if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
    if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);
});

// Function: loadDoctorCards
// Purpose: Fetch all doctors and display them as cards
async function loadDoctorCards() {
    try {
        // Call getDoctors() from the service layer
        const doctors = await getDoctors();

        // Clear the current content area
        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "";

        // For each doctor returned, create a card and append it
        doctors.forEach((doctor) => {
            const card = createDoctorCard(doctor);
            contentDiv.appendChild(card);
        });
    } catch (error) {
        // Handle any fetch errors by logging them
        console.error("Error loading doctor cards:", error);
    }
}

// Function: filterDoctorsOnChange
// Purpose: Filter doctors based on name, available time, and specialty
async function filterDoctorsOnChange() {
    try {
        // Read values from the search bar and filters
        const searchBar = document.getElementById("searchBar");
        const timeFilter = document.getElementById("timeFilter");
        const specialtyFilter = document.getElementById("specialtyFilter");

        const nameValue = searchBar ? searchBar.value.trim() : "";
        const timeValue = timeFilter ? timeFilter.value : "";
        const specialtyValue = specialtyFilter ? specialtyFilter.value : "";

        // Normalize empty values to null
        const name = nameValue !== "" ? nameValue : null;
        const time = timeValue !== "" ? timeValue : null;
        const specialty = specialtyValue !== "" ? specialtyValue : null;

        // Call filterDoctors(name, time, specialty) from the service
        const doctors = await filterDoctors(name, time, specialty);

        if (doctors && doctors.length > 0) {
            // If doctors are found, render them
            renderDoctorCards(doctors);
        } else {
            // If no doctors match the filter, show a message
            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found with the given filters.</p>`;
        }
    } catch (error) {
        // Catch and display any errors with an alert
        console.error("Error filtering doctors:", error);
        alert("An error occurred while filtering doctors.");
    }
}

// Function: renderDoctorCards
// Purpose: A helper function to render a list of doctors passed to it
function renderDoctorCards(doctors) {
    // Clear the content area
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    // Loop through the doctors and append each card to the content area
    doctors.forEach((doctor) => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
    });
}

// Function: adminAddDoctor
// Purpose: Collect form data and add a new doctor to the system
async function adminAddDoctor() {
    // Collect input values from the modal form
    const name = document.getElementById("doctorName").value;
    const email = document.getElementById("doctorEmail").value;
    const phone = document.getElementById("doctorPhone").value;
    const password = document.getElementById("doctorPassword").value;
    const specialty = document.getElementById("doctorSpecialty").value;

    const availableTimesInput = document.getElementById("doctorAvailableTimes");
    const availableTimes = availableTimesInput
        ? availableTimesInput.value.split(",").map((t) => t.trim())
        : [];

    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem("token");

    // If no token is found, show an alert and stop execution
    if (!token) {
        alert("You must be logged in as an admin to add a doctor.");
        return;
    }

    // Build a doctor object with the form values
    const doctor = {
        name,
        email,
        phone,
        password,
        specialty,
        availableTimes,
    };

    try {
        // Call saveDoctor(doctor, token) from the service
        const result = await saveDoctor(doctor, token);

        if (result.success) {
            // If save is successful, show a success message
            alert("Doctor added successfully.");

            // Close the modal and reload the page
            const modal = document.getElementById("modal");
            if (modal) modal.style.display = "none";
            window.location.reload();
        } else {
            // If saving fails, show an error message
            alert(result.message || "Failed to add doctor.");
        }
    } catch (error) {
        console.error("Error adding doctor:", error);
        alert("An error occurred while adding the doctor.");
    }
}