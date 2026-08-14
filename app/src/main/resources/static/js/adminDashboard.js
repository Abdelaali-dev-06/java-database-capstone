// adminDashboard.js

import { createDoctorCard } from "/js/components/doctorCard.js";
import { openModal } from "/js/components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "/js/services/doctorServices.js";

// ✅ CRITICAL FIX: Expose functions to window scope for inline HTML event handlers (e.g. onclick="openModal(...)")
window.openModal = openModal;
window.adminAddDoctor = adminAddDoctor;

// Attach event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const addDocBtn = document.getElementById("addDocBtn");
    if (addDocBtn) {
        addDocBtn.addEventListener("click", () => {
            openModal("addDoctor");
        });
    }

    // Load initial doctor list
    loadDoctorCards();

    // Attach listeners to search and filters
    const searchBar = document.getElementById("searchBar");
    const timeFilter = document.getElementById("timeFilter");
    const specialityFilter = document.getElementById("specialityFilter");

    if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
    if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
    if (specialityFilter) specialityFilter.addEventListener("change", filterDoctorsOnChange);
});

// Function: loadDoctorCards
async function loadDoctorCards() {
    try {
        const response = await getDoctors();
        const doctors = Array.isArray(response) ? response : (response?.doctors || []);

        const contentDiv = document.getElementById("content");
        if (contentDiv) contentDiv.innerHTML = "";

        doctors.forEach((doctor) => {
            const card = createDoctorCard(doctor);
            contentDiv.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading doctor cards:", error);
    }
}

// Function: filterDoctorsOnChange
async function filterDoctorsOnChange() {
    try {
        const searchBar = document.getElementById("searchBar");
        const timeFilter = document.getElementById("timeFilter");
        const specialityFilter = document.getElementById("specialityFilter");

        const nameValue = searchBar ? searchBar.value.trim() : "";
        const timeValue = timeFilter ? timeFilter.value : "";
        const specialityValue = specialityFilter ? specialityFilter.value : "";

        const name = nameValue !== "" ? nameValue : null;
        const time = timeValue !== "" ? timeValue : null;
        const speciality = specialityValue !== "" ? specialityValue : null;

        const response = await filterDoctors(name, time, speciality);
        const doctors = Array.isArray(response) ? response : (response?.doctors || []);

        if (doctors && doctors.length > 0) {
            renderDoctorCards(doctors);
        } else {
            const contentDiv = document.getElementById("content");
            if (contentDiv) {
                contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found with the given filters.</p>`;
            }
        }
    } catch (error) {
        console.error("Error filtering doctors:", error);
        alert("An error occurred while filtering doctors.");
    }
}

// Helper: renderDoctorCards
function renderDoctorCards(doctors) {
    const contentDiv = document.getElementById("content");
    if (!contentDiv) return;

    contentDiv.innerHTML = "";

    doctors.forEach((doctor) => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
    });
}

async function adminAddDoctor(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("doctorName")?.value || "";
    const email = document.getElementById("doctorEmail")?.value || "";
    const phone = document.getElementById("doctorPhone")?.value || "";
    const password = document.getElementById("doctorPassword")?.value || "";

    // ✅ Read specialty from the <select id="specialization"> element
    const specialtySelect = document.getElementById("specialization");
    const specialty = specialtySelect ? specialtySelect.value : "";

    // ✅ Collect values from all checked availability checkboxes
    const checkedBoxes = document.querySelectorAll('input[name="availability"]:checked');
    const availableTimes = Array.from(checkedBoxes).map((box) => box.value);

    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in as an admin to add a doctor.");
        return;
    }

    // Pass both specialty keys for safety across different backend models
    const doctor = {
        name,
        email,
        phone,
        password,
        specialty,
        speciality: specialty,
        availableTimes,
    };

    try {
        const result = await saveDoctor(doctor, token);

        if (result && result.success) {
            alert("Doctor added successfully.");
            const modal = document.getElementById("modal");
            if (modal) modal.style.display = "none";
            window.location.reload();
        } else {
            alert(result?.message || "Failed to add doctor.");
        }
    } catch (error) {
        console.error("Error adding doctor:", error);
        alert("An error occurred while adding the doctor.");
    }
}