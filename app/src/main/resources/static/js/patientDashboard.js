// patientDashboard.js
import { getDoctors, filterDoctors } from './services/doctorServices.js';
import { openModal } from './components/modals.js';
import { createDoctorCard } from './components/doctorCard.js';
import { patientSignup, patientLogin } from './services/patientServices.js';

// Expose openModal globally so header.js can call it without modifying header.js
window.openModal = openModal;

// Consolidate DOMContentLoaded logic into a single event listener
document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();

  const signupBtn = document.getElementById("patientSignup");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => openModal("patientSignup"));
  }

  const loginBtn = document.getElementById("patientLogin");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => openModal("patientLogin"));
  }

  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpeciality = document.getElementById("filterSpeciality");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
  if (filterSpeciality) filterSpeciality.addEventListener("change", filterDoctorsOnChange);
});

function loadDoctorCards() {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  getDoctors()
      .then(doctors => {
        contentDiv.innerHTML = "";
        doctors.forEach(doctor => {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Failed to load doctors:", error);
      });
}

function filterDoctorsOnChange() {
  const searchElem = document.getElementById("searchBar");
  const timeElem = document.getElementById("filterTime");
  const specialityElem = document.getElementById("filterSpeciality");

  const searchBar = searchElem ? searchElem.value.trim() : "";
  const filterTime = timeElem ? timeElem.value : "";
  const filterSpeciality = specialityElem ? specialityElem.value : "";

  const name = searchBar.length > 0 ? searchBar : null;
  const time = filterTime.length > 0 ? filterTime : null;
  const speciality = filterSpeciality.length > 0 ? filterSpeciality : null;

  filterDoctors(name, time, speciality)
      .then(response => {
        const doctors = response?.doctors || [];
        const contentDiv = document.getElementById("content");
        if (!contentDiv) return;

        contentDiv.innerHTML = "";

        if (doctors.length > 0) {
          doctors.forEach(doctor => {
            const card = createDoctorCard(doctor);
            contentDiv.appendChild(card);
          });
        } else {
          contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
        }
      })
      .catch(error => {
        console.error("Failed to filter doctors:", error);
        alert("❌ An error occurred while filtering doctors.");
      });
}

window.signupPatient = async function () {
  try {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    const data = { name, email, password, phone, address };
    const { success, message } = await patientSignup(data);
    if (success) {
      alert(message);
      const modal = document.getElementById("modal");
      if (modal) modal.style.display = "none";
      window.location.reload();
    } else {
      alert(message);
    }
  } catch (error) {
    console.error("Signup failed:", error);
    alert("❌ An error occurred while signing up.");
  }
};

window.loginPatient = async function () {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = { email, password };
    const response = await patientLogin(data);

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      let token = "";

      // Safely extract token whether backend returns JSON object or raw text/string
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        token = typeof result === 'string' ? result : (result.token || result.jwt || result.accessToken || result.data);
      } else {
        token = await response.text();
      }

      if (!token) {
        alert("❌ Login failed: Server did not return a valid token.");
        return;
      }

      if (typeof window.selectRole === 'function') {
        window.selectRole('loggedPatient');
      }

      localStorage.setItem('token', token.trim());
      localStorage.setItem('userRole', 'loggedPatient');
      window.location.href = '/pages/loggedPatientDashboard.html';
    } else {
      alert('❌ Invalid credentials!');
    }
  } catch (error) {
    alert("❌ Failed to Login");
    console.error("Error :: loginPatient :: ", error);
  }
};