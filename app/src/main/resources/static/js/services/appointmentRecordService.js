import { API_BASE_URL } from "../config/config.js";
const APPOINTMENT_API = `${API_BASE_URL}/appointments`;

// Doctor fetches all patient appointments
export async function getAllAppointments(date, patientName, token) {
  // Ensure token and patientName are properly passed
  const safePatientName = patientName && patientName.trim() !== "" ? patientName : "null";
  const safeToken = token || "invalid_token";

  const response = await fetch(`${APPOINTMENT_API}/${date}/${safePatientName}/${safeToken}`);
  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  const data = await response.json();
  // Extract array from wrapper object { appointments: [...] }
  return data.appointments || data;
}

export async function bookAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while booking appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}

export async function updateAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while updating appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}