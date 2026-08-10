// doctorCard.js

import { showBookingOverlay } from "../loggedPatient.js";
import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";

// Function to create and return a DOM element for a single doctor card
export function createDoctorCard(doctor) {
    // Create the main container for the doctor card
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    // Retrieve the current user role from localStorage
    const role = localStorage.getItem("userRole");

    // Create a div to hold doctor information
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    // Create and set the doctor's name
    const name = document.createElement("h3");
    name.textContent = doctor.name;

    // Create and set the doctor's specialization
    const specialization = document.createElement("p");
    specialization.textContent = `Specialty: ${doctor.specialty}`;

    // Create and set the doctor's email
    const email = document.createElement("p");
    email.textContent = `Email: ${doctor.email}`;

    // Create and list available appointment times
    const availability = document.createElement("p");
    const times = Array.isArray(doctor.availableTimes)
        ? doctor.availableTimes.join(", ")
        : "Not available";
    availability.textContent = `Available: ${times}`;

    // Append all info elements to the doctor info container
    infoDiv.appendChild(name);
    infoDiv.appendChild(specialization);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);

    // Create a container for card action buttons
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    // === ADMIN ROLE ACTIONS ===
    if (role === "admin") {
        // Create a delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        // Add click handler for delete button
        deleteBtn.addEventListener("click", async () => {
            const confirmDelete = confirm(`Delete Dr. ${doctor.name}?`);
            if (!confirmDelete) return;

            // Get the admin token from localStorage
            const token = localStorage.getItem("token");

            try {
                // Call API to delete the doctor
                const result = await deleteDoctor(doctor.id, token);

                // Show result and remove card if successful
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

        // Add delete button to actions container
        actionsDiv.appendChild(deleteBtn);
    }

    // === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
    else if (role === "patient") {
        // Create a book now button
        const bookNowBtn = document.createElement("button");
        bookNowBtn.textContent = "Book Now";

        bookNowBtn.addEventListener("click", () => {
            // Alert patient to log in before booking
            alert("Please log in to book an appointment.");
        });

        // Add button to actions container
        actionsDiv.appendChild(bookNowBtn);
    }

    // === LOGGED-IN PATIENT ROLE ACTIONS ===
    else if (role === "loggedPatient") {
        // Create a book now button
        const bookNowBtn = document.createElement("button");
        bookNowBtn.textContent = "Book Now";

        // Handle booking logic for logged-in patient
        bookNowBtn.addEventListener("click", async (event) => {
            // Redirect if token not available
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/";
                return;
            }

            try {
                // Fetch patient data with token
                const patientData = await getPatientData(token);

                // Show booking overlay UI with doctor and patient info
                showBookingOverlay(event, doctor, patientData);
            } catch (error) {
                console.error("Error fetching patient data:", error);
                alert("Unable to load your details. Please try again.");
            }
        });

        // Add button to actions container
        actionsDiv.appendChild(bookNowBtn);
    }

    // Append doctor info and action buttons to the card
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    // Return the complete doctor card element
    return card;
}