// static/js/components/doctorCard.js

import { showBookingOverlay } from "../loggedPatient.js";
import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";

export function createDoctorCard(doctor) {
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    const role = localStorage.getItem("userRole");

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    const name = document.createElement("h3");
    name.textContent = doctor.name;

    const specialization = document.createElement("p");
    const doctorSpecialty = doctor.speciality || doctor.specialty || 'N/A';
    specialization.textContent = `Speciality: ${doctorSpecialty}`;

    const email = document.createElement("p");
    email.textContent = `Email: ${doctor.email}`;

    const availability = document.createElement("p");
    const times = Array.isArray(doctor.availableTimes)
        ? doctor.availableTimes.join(", ")
        : "Not available";
    availability.textContent = `Available: ${times}`;

    infoDiv.appendChild(name);
    infoDiv.appendChild(specialization);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    if (role === "admin") {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", async () => {
            const confirmDelete = confirm(`Delete Dr. ${doctor.name}?`);
            if (!confirmDelete) return;

            const token = localStorage.getItem("token");

            try {
                const result = await deleteDoctor(doctor.id, token);

                if (result.success) {
                    alert("Doctor deleted successfully.");
                    card.remove();
                } else {
                    alert(result.message || "Failed to delete doctor.");
                }
            } catch (error) {
                console.error("Error deleting doctor:", error);
                alert("An error occurred while deleting the doctor.");
            }
        });

        actionsDiv.appendChild(deleteBtn);
    } else if (role === "patient") {
        const bookNowBtn = document.createElement("button");
        bookNowBtn.textContent = "Book Now";

        bookNowBtn.addEventListener("click", () => {
            alert("Please log in to book an appointment.");
        });

        actionsDiv.appendChild(bookNowBtn);
    } else if (role === "loggedPatient") {
        const bookNowBtn = document.createElement("button");
        bookNowBtn.textContent = "Book Now";

        bookNowBtn.addEventListener("click", async (event) => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/";
                return;
            }

            try {
                const patientData = await getPatientData(token);
                showBookingOverlay(event, doctor, patientData);
            } catch (error) {
                console.error("Error fetching patient data:", error);
                alert("Unable to load your details. Please try again.");
            }
        });

        actionsDiv.appendChild(bookNowBtn);
    }

    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    return card;
}