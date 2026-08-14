import { openModal } from "/js/components/modals.js";
import { API_BASE_URL } from "/js/config/config.js";

const cleanBaseUrl = API_BASE_URL ? API_BASE_URL.replace(/\/+$/, "") : "";
const ADMIN_API = `${cleanBaseUrl}/admin/login`;
const DOCTOR_API = `${cleanBaseUrl}/doctor/login`;

window.onload = function () {
    const adminLoginBtn = document.getElementById("adminLogin");
    const doctorLoginBtn = document.getElementById("doctorLogin");

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener("click", () => openModal("adminLogin"));
    }

    if (doctorLoginBtn) {
        doctorLoginBtn.addEventListener("click", () => openModal("doctorLogin"));
    }
};

window.adminLoginHandler = async function (event) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    try {
        const usernameEl = document.getElementById("adminUsername");
        const passwordEl = document.getElementById("adminPassword");

        if (!usernameEl || !passwordEl) {
            alert("Admin login input fields not found.");
            return;
        }

        const usernameVal = usernameEl.value.trim();
        const passwordVal = passwordEl.value.trim();

        if (!usernameVal || !passwordVal) {
            alert("Please enter both username and password.");
            return;
        }

        // ✅ FIX: Payload now matches MySQL schema (id, username, password)
        const adminPayload = {
            username: usernameVal,
            password: passwordVal
        };

        const response = await fetch(ADMIN_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(adminPayload),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "admin");

            if (typeof selectRole === "function") {
                selectRole("admin");
            } else if (typeof window.selectRole === "function") {
                window.selectRole("admin");
            }
        } else {
            const errData = await response.json().catch(() => ({}));
            alert(errData.message || "Invalid admin credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error during admin login:", error);
        alert("Something went wrong while logging in. Please try again later.");
    }
};

window.doctorLoginHandler = async function (event) {
    // Prevent form submission reload immediately
    if (event) {
        event.preventDefault();
    }

    try {
        const emailEl = document.getElementById("doctorEmail");
        const passwordEl = document.getElementById("doctorPassword");

        if (!emailEl || !passwordEl) {
            alert("Doctor login input fields not found.");
            return;
        }

        const emailVal = emailEl.value.trim();
        const passwordVal = passwordEl.value.trim();

        if (!emailVal || !passwordVal) {
            alert("Please enter both email and password.");
            return;
        }

        const doctorPayload = {
            email: emailVal,
            username: emailVal,
            password: passwordVal
        };

        const response = await fetch(DOCTOR_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(doctorPayload),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "doctor");

            if (typeof selectRole === "function") {
                selectRole("doctor");
            } else if (typeof window.selectRole === "function") {
                window.selectRole("doctor");
            } else {
                window.location.href = `/doctorDashboard/${data.token}`;
            }
        } else if (response.status === 401) {
            const errData = await response.json().catch(() => ({}));
            alert(errData.message || "Invalid doctor credentials (email or password incorrect).");
        } else {
            const errData = await response.json().catch(() => ({}));
            alert(errData.message || ("Login failed with status " + response.status + ". Please try again."));
        }
    } catch (error) {
        console.error("Error during doctor login:", error);
        alert("Something went wrong while logging in. Please try again later.");
    }
};