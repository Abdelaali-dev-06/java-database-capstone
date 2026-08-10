// doctorServices.js

// Import the base API URL from the config file
import { API_BASE_URL } from "../config/config.js";

// Define a constant DOCTOR_API to hold the full endpoint for doctor-related actions
const DOCTOR_API = `${API_BASE_URL}/doctor`;

// Function: getDoctors
// Purpose: Fetch the list of all doctors from the API
export async function getDoctors() {
    try {
        // Use fetch() to send a GET request to the DOCTOR_API endpoint
        const response = await fetch(DOCTOR_API);

        // Convert the response to JSON
        const data = await response.json();

        // Return the 'doctors' array from the response
        return data.doctors;
    } catch (error) {
        // If there's an error, log it and return an empty array
        console.error("Error fetching doctors:", error);
        return [];
    }
}

// Function: deleteDoctor
// Purpose: Delete a specific doctor using their ID and an authentication token
export async function deleteDoctor(id, token) {
    try {
        // Use fetch() with the DELETE method
        // The URL includes the doctor ID and token as path parameters
        const response = await fetch(`${DOCTOR_API}/${id}/${token}`, {
            method: "DELETE",
        });

        // Convert the response to JSON
        const data = await response.json();

        // Return an object with success and message
        return {
            success: response.ok,
            message: data.message,
        };
    } catch (error) {
        // If an error occurs, log it and return a default failure response
        console.error("Error deleting doctor:", error);
        return {
            success: false,
            message: "Failed to delete doctor. Please try again later.",
        };
    }
}

// Function: saveDoctor
// Purpose: Save (create) a new doctor using a POST request
export async function saveDoctor(doctor, token) {
    try {
        // Use fetch() with the POST method
        // URL includes the token in the path
        const response = await fetch(`${DOCTOR_API}/${token}`, {
            method: "POST",
            // Set headers to specify JSON content type
            headers: {
                "Content-Type": "application/json",
            },
            // Convert the doctor object to JSON in the request body
            body: JSON.stringify(doctor),
        });

        // Parse the JSON response
        const data = await response.json();

        // Return success and message
        return {
            success: response.ok,
            message: data.message,
        };
    } catch (error) {
        // Catch and log errors
        console.error("Error saving doctor:", error);

        // Return a failure response
        return {
            success: false,
            message: "Failed to add doctor. Please try again later.",
        };
    }
}

// Function: filterDoctors
// Purpose: Fetch doctors based on filtering criteria (name, time, and specialty)
export async function filterDoctors(name, time, specialty) {
    try {
        // Use fetch() with the GET method
        // Include the name, time, and specialty as URL path parameters
        const response = await fetch(`${DOCTOR_API}/filter/${name}/${time}/${specialty}`);

        // Check if the response is OK
        if (response.ok) {
            // If yes, parse and return the doctor data
            const data = await response.json();
            return data;
        } else {
            // If no, log the error and return an object with an empty 'doctors' array
            console.error("Failed to filter doctors:", response.statusText);
            return { doctors: [] };
        }
    } catch (error) {
        // Catch any other errors, alert the user, and return a default empty result
        console.error("Error filtering doctors:", error);
        alert("Something went wrong while filtering doctors.");
        return { doctors: [] };
    }
}