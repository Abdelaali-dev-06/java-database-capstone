// assets/js/services/patientServices.js
import { API_BASE_URL } from "../config/config.js";
const PATIENT_API = API_BASE_URL + '/patient';

// For creating a patient in DB
export async function patientSignup(data) {
  try {
    const response = await fetch(`${PATIENT_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Signup failed");
    }
    return { success: response.ok, message: result.message };
  } catch (error) {
    console.error("Error :: patientSignup :: ", error);
    return { success: false, message: error.message };
  }
}

// For logging in patient
export async function patientLogin(data) {
  try {
    return await fetch(`${PATIENT_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error("Error :: patientLogin :: ", error);
    throw error;
  }
}

// For getting patient data
export async function getPatientData(token) {
  try {
    const response = await fetch(`${PATIENT_API}/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      return { unauthorized: true };
    }

    if (!response.ok) return null;
    const data = await response.json();
    return data.patient || null;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

// For fetching patient appointments
export async function getPatientAppointments(id, token, user) {
  try {
    // Matches the backend controller route: /patient/{id}/{token}/{user}
    const response = await fetch(`${PATIENT_API}/${id}/${token}/${user}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      console.warn("401 Unauthorized: The backend rejected this token or route.");
      return { unauthorized: true, appointments: [] };
    }

    if (!response.ok) {
      console.error(`Appointment Fetch Error: ${response.status} ${response.statusText}`);
      return { unauthorized: false, appointments: [] };
    }

    const data = await response.json();
    return { unauthorized: false, appointments: data.appointments || [] };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return { unauthorized: false, appointments: [] };
  }
}

// For filtering appointments
export async function filterAppointments(condition, name, token) {
  try {
    const response = await fetch(`${PATIENT_API}/filter/${condition}/${name}/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      return { unauthorized: true, appointments: [] };
    }

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to filter appointments:", response.statusText);
      return { appointments: [] };
    }
  } catch (error) {
    console.error("Error filtering appointments:", error);
    return { appointments: [] };
  }
}