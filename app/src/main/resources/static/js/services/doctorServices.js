import { API_BASE_URL } from "../config/config.js";

const cleanBaseUrl = API_BASE_URL ? API_BASE_URL.replace(/\/+$/, "") : "";
const DOCTOR_API = `${cleanBaseUrl}/doctor`;

export async function getDoctors() {
    try {
        const response = await fetch(DOCTOR_API);

        if (!response.ok) {
            console.error("Server returned an error:", response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}

export async function deleteDoctor(id, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${id}/${token}`, {
            method: "DELETE",
        });

        const data = await response.json();

        return {
            success: response.ok,
            message: data.message,
        };
    } catch (error) {
        console.error("Error deleting doctor:", error);
        return {
            success: false,
            message: "Failed to delete doctor. Please try again later.",
        };
    }
}

export async function saveDoctor(doctor, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(doctor),
        });

        const data = await response.json();

        return {
            success: response.ok,
            message: data.message,
        };
    } catch (error) {
        console.error("Error saving doctor:", error);
        return {
            success: false,
            message: "Failed to add doctor. Please try again later.",
        };
    }
}

export async function filterDoctors(name, time, speciality) {
    try {
        const response = await fetch(`${DOCTOR_API}/filter/${name}/${time}/${speciality}`);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Failed to filter doctors:", response.statusText);
            return { doctors: [] };
        }
    } catch (error) {
        console.error("Error filtering doctors:", error);
        alert("Something went wrong while filtering doctors.");
        return { doctors: [] };
    }
}