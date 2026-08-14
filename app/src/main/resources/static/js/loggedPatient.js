import { getDoctors, filterDoctors } from '/js/services/doctorServices.js';
import { createDoctorCard } from '/js/components/doctorCard.js';
import { bookAppointment } from '/js/services/appointmentRecordService.js';

document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();
  setupFilterListeners();
});

function loadDoctorCards() {
  getDoctors()
      .then(doctors => {
        const contentDiv = document.getElementById("content");
        if (contentDiv) {
          contentDiv.innerHTML = "";
          doctors.forEach(doctor => {
            const card = createDoctorCard(doctor);
            contentDiv.appendChild(card);
          });
        }
      })
      .catch(error => {
        console.error("Failed to load doctors:", error);
      });
}

// ✅ Safeguard listener registration against null elements
function setupFilterListeners() {
  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpeciality = document.getElementById("filterSpeciality");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
  if (filterSpeciality) filterSpeciality.addEventListener("change", filterDoctorsOnChange);
}

function filterDoctorsOnChange() {
  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpeciality = document.getElementById("filterSpeciality");

  const searchVal = searchBar ? searchBar.value.trim() : "";
  const timeVal = filterTime ? filterTime.value : "";
  const specialityVal = filterSpeciality ? filterSpeciality.value : "";

  const name = searchVal.length > 0 ? searchVal : null;
  const time = timeVal.length > 0 ? timeVal : null;
  const speciality = specialityVal.length > 0 ? specialityVal : null;

  filterDoctors(name, time, speciality)
      .then(response => {
        const doctors = response.doctors || [];
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

export function showBookingOverlay(e, doctor, patient) {
  const button = e.target;
  const ripple = document.createElement("div");
  ripple.classList.add("ripple-overlay");
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.classList.add("active"), 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  modalApp.innerHTML = `
    <h2>Book Appointment</h2>
    <input class="input-field" type="text" value="${patient.name || ''}" disabled />
    <input class="input-field" type="text" value="${doctor.name || ''}" disabled />
    <input class="input-field" type="text" value="${doctor.speciality || ''}" disabled/>
    <input class="input-field" type="email" value="${doctor.email || ''}" disabled/>
    <input class="input-field" type="date" id="appointment-date" />
    <select class="input-field" id="appointment-time">
      <option value="">Select time</option>
      ${doctor.availableTimes ? doctor.availableTimes.map(t => `<option value="${t}">${t}</option>`).join('') : ''}
    </select>
    <button class="confirm-booking">Confirm Booking</button>
  `;

  document.body.appendChild(modalApp);

  setTimeout(() => modalApp.classList.add("active"), 600);

  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const dateInput = modalApp.querySelector("#appointment-date");
    const timeInput = modalApp.querySelector("#appointment-time");
    const date = dateInput ? dateInput.value : "";
    const time = timeInput ? timeInput.value : "";

    if (!date || !time) {
      alert("Please select both a date and time.");
      return;
    }

    const token = localStorage.getItem("token");
    const startTime = time.split('-')[0];
    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentTime: `${date}T${startTime}:00`,
      status: 0
    };

    const { success, message } = await bookAppointment(appointment, token);

    if (success) {
      alert("Appointment Booked successfully");
      ripple.remove();
      modalApp.remove();
    } else {
      alert("❌ Failed to book an appointment :: " + message);
    }
  });
}

export function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (contentDiv) {
    contentDiv.innerHTML = "";
    doctors.forEach(doctor => {
      const card = createDoctorCard(doctor);
      contentDiv.appendChild(card);
    });
  }
}