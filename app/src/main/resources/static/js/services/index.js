// index.js

// Import the openModal function to handle showing login popups/modals
import { openModal } from "./components/modal.js";

// Import the base API URL from the config file
import { API_BASE_URL } from "./config/config.js";

// Define constants for the admin and doctor login API endpoints
const ADMIN_API = `${API_BASE_URL}/admin/login`;
const DOCTOR_API = `${API_BASE_URL}/doctor/login`;

// Use window.onload to ensure DOM elements are available after page load
window.onload = function () {
    // Select the "adminLogin" and "doctorLogin" buttons
    const adminLoginBtn = document.getElementById("adminLogin");
    const doctorLoginBtn = document.getElementById("doctorLogin");

    // If the admin login button exists, open the admin login modal on click
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener("click", () => {
            openModal("adminLogin");
        });
    }

    // If the doctor login button exists, open the doctor login modal on click
    if (doctorLoginBtn) {
        doctorLoginBtn.addEventListener("click", () => {
            openModal("doctorLogin");
        });
    }
};

// Define adminLoginHandler on the global window object
window.adminLoginHandler = async function () {
    try {
        // Step 1: Get the entered username and password from the input fields
        const username = document.getElementById("adminUsername").value;
        const password = document.getElementById("adminPassword").value;

        // Step 2: Create an admin object with these credentials
        const admin = { username, password };

        // Step 3: Send a POST request to the ADMIN_API endpoint
        const response = await fetch(ADMIN_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(admin),
        });

        // Step 4: If the response is successful
        if (response.ok) {
            const data = await response.json();

            // Store the token in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "admin");

            // Call selectRole('admin') to proceed with admin-specific behavior
            selectRole("admin");
        } else {
            // Step 5: If login fails or credentials are invalid
            alert("Invalid admin credentials. Please try again.");
        }
    } catch (error) {
        // Step 6: Handle network or server errors
        console.error("Error during admin login:", error);
        alert("Something went wrong while logging in. Please try again later.");
    }
};

// Define doctorLoginHandler on the global window object
window.doctorLoginHandler = async function () {
    try {
        // Step 1: Get the entered email and password from the input fields
        const email = document.getElementById("doctorEmail").value;
        const password = document.getElementById("doctorPassword").value;

        // Step 2: Create a doctor object with these credentials
        const doctor = { email, password };

        // Step 3: Send a POST request to the DOCTOR_API endpoint
        const response = await fetch(DOCTOR_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(doctor),
        });

        // Step 4: If login is successful
        if (response.ok) {
            const data = await response.json();

            // Store the token in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "doctor");

            // Call selectRole('doctor') to proceed with doctor-specific behavior
            selectRole("doctor");
        } else {
            // Step 5: If login fails
            alert("Invalid doctor credentials. Please try again.");
        }
    } catch (error) {
        // Step 6: Handle errors gracefully
        console.error("Error during doctor login:", error);
        alert("Something went wrong while logging in. Please try again later.");
    }
};