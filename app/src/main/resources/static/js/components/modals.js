// static/js/components/modals.js

export function openModal(type) {
  let modalContent = '';

  if (type === 'addDoctor') {
    modalContent = `
        <h2>Add Doctor</h2>
        <form id="addDoctorForm">
          <input type="text" id="doctorName" placeholder="Doctor Name" class="input-field" required>
          <select id="specialization" class="input-field select-dropdown" required>
              <option value="">Specialization</option>
              <option value="cardiologist">Cardiologist</option>
              <option value="dermatologist">Dermatologist</option>
              <option value="neurologist">Neurologist</option>
              <option value="pediatrician">Pediatrician</option>
              <option value="orthopedic">Orthopedic</option>
              <option value="gynecologist">Gynecologist</option>
              <option value="psychiatrist">Psychiatrist</option>
              <option value="dentist">Dentist</option>
              <option value="ophthalmologist">Ophthalmologist</option>
              <option value="ent">ENT Specialist</option>
              <option value="urologist">Urologist</option>
              <option value="oncologist">Oncologist</option>
              <option value="gastroenterologist">Gastroenterologist</option>
              <option value="general">General Physician</option>
          </select>
          <input type="email" id="doctorEmail" placeholder="Email" class="input-field" required>
          <input type="password" id="doctorPassword" placeholder="Password" class="input-field" required>
          <input type="text" id="doctorPhone" placeholder="Mobile No." class="input-field" required>
          <div class="availability-container">
            <label class="availabilityLabel">Select Availability:</label>
            <div class="checkbox-group">
                <label><input type="checkbox" name="availability" value="09:00-10:00"> 9:00 AM - 10:00 AM</label>
                <label><input type="checkbox" name="availability" value="10:00-11:00"> 10:00 AM - 11:00 AM</label>
                <label><input type="checkbox" name="availability" value="11:00-12:00"> 11:00 AM - 12:00 PM</label>
                <label><input type="checkbox" name="availability" value="12:00-13:00"> 12:00 PM - 1:00 PM</label>
            </div>
          </div>
          <button type="submit" class="dashboard-btn" id="saveDoctorBtn">Save</button>
        </form>
      `;
  } else if (type === 'patientLogin') {
    modalContent = `
        <h2>Patient Login</h2>
        <form id="patientLoginForm">
          <input type="text" id="email" placeholder="Email" class="input-field" required>
          <input type="password" id="password" placeholder="Password" class="input-field" required>
          <button type="submit" class="dashboard-btn" id="loginBtn">Login</button>
        </form>
      `;
  } else if (type === "patientSignup") {
    modalContent = `
        <h2>Patient Signup</h2>
        <form id="patientSignupForm">
          <input type="text" id="name" placeholder="Name" class="input-field" required>
          <input type="email" id="email" placeholder="Email" class="input-field" required>
          <input type="password" id="password" placeholder="Password" class="input-field" required>
          <input type="text" id="phone" placeholder="Phone" class="input-field" required>
          <input type="text" id="address" placeholder="Address" class="input-field" required>
          <button type="submit" class="dashboard-btn" id="signupBtn">Signup</button>
        </form>
      `;
  } else if (type === 'adminLogin') {
    modalContent = `
        <h2>Admin Login</h2>
        <form id="adminLoginForm">
          <input type="text" id="adminUsername" name="username" placeholder="Username" class="input-field" required>
          <input type="password" id="adminPassword" name="password" placeholder="Password" class="input-field" required>
          <button type="submit" class="dashboard-btn" id="adminLoginBtn">Login</button>
        </form>
      `;
  } else if (type === 'doctorLogin') {
    modalContent = `
        <h2>Doctor Login</h2>
        <form id="doctorLoginForm">
          <input type="text" id="doctorEmail" placeholder="Email" class="input-field" required>
          <input type="password" id="doctorPassword" placeholder="Password" class="input-field" required>
          <button type="submit" class="dashboard-btn" id="doctorLoginBtn">Login</button>
        </form>
      `;
  }

  const modalBody = document.getElementById('modal-body');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');

  if (modalBody) modalBody.innerHTML = modalContent;
  if (modal) modal.style.display = 'block';

  if (closeModalBtn) {
    closeModalBtn.onclick = () => {
      if (modal) modal.style.display = 'none';
    };
  }

  // --- Attach Form Submit Listeners (Prevents GET requests & handles Enter Key) ---

  if (type === "patientSignup") {
    const signupForm = document.getElementById("patientSignupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (typeof window.signupPatient === "function") window.signupPatient(e);
      });
    }
  }

  if (type === "patientLogin") {
    const loginForm = document.getElementById("patientLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (typeof window.loginPatient === "function") window.loginPatient(e);
      });
    }
  }

  if (type === 'addDoctor') {
    const addDoctorForm = document.getElementById('addDoctorForm');
    if (addDoctorForm) {
      addDoctorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof window.adminAddDoctor === "function") window.adminAddDoctor(e);
      });
    }
  }

  if (type === 'adminLogin') {
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof window.adminLoginHandler === "function") window.adminLoginHandler(e);
      });
    }
  }

  if (type === 'doctorLogin') {
    const doctorLoginForm = document.getElementById('doctorLoginForm');
    if (doctorLoginForm) {
      doctorLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof window.doctorLoginHandler === "function") window.doctorLoginHandler(e);
      });
    }
  }
}