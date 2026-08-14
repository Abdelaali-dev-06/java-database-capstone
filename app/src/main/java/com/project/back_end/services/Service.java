package com.project.back_end.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

// NOTE: class named "Service" collides with org.springframework.stereotype.Service,
// so the annotation below is fully qualified instead of imported.
@org.springframework.stereotype.Service
public class Service {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @Autowired
    public Service(TokenService tokenService,
                   AdminRepository adminRepository,
                   DoctorRepository doctorRepository,
                   PatientRepository patientRepository,
                   DoctorService doctorService,
                   PatientService patientService) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    // Checks if the provided JWT token is valid for a specific role.
    // Returns an empty map if valid; a map containing "error" if invalid.
    public Map<String, Object> validateToken(String token, String role) {
        Map<String, Object> result = new HashMap<>();
        boolean isValid = tokenService.validateToken(token, role);

        if (!isValid) {
            result.put("error", "Invalid or expired token");
        }

        return result;
    }

    // Validates admin login credentials
    public ResponseEntity<Map<String, String>> validateAdmin(Admin admin) {
        Map<String, String> response = new HashMap<>();
        try {
            Admin foundAdmin = adminRepository.findByUsername(admin.getUsername());

            if (foundAdmin != null) {
                if (foundAdmin.getPassword().equals(admin.getPassword())) {
                    String token = tokenService.generateToken(foundAdmin.getUsername());
                    response.put("token", token);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Invalid credentials");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            } else {
                response.put("message", "Admin not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Filters doctors based on name, speciality, and time (delegates to DoctorService)
    public Map<String, Object> filterDoctor(String name, String time, String speciality) {
        Map<String, Object> result = new HashMap<>();

        boolean hasName = name != null && !name.equalsIgnoreCase("null") && !name.isBlank();
        boolean hasTime = time != null && !time.equalsIgnoreCase("null") && !time.isBlank();
        boolean hasSpeciality = speciality != null && !speciality.equalsIgnoreCase("null") && !speciality.isBlank();

        List<Doctor> doctors;

        if (hasName && hasSpeciality && hasTime) {
            doctors = doctorService.filterDoctorsByNameSpecilityandTime(name, speciality, time);
        } else if (hasName && hasTime) {
            doctors = doctorService.filterDoctorByNameAndTime(name, time);
        } else if (hasName && hasSpeciality) {
            doctors = doctorService.filterDoctorByNameAndSpecility(name, speciality);
        } else if (hasTime && hasSpeciality) {
            doctors = doctorService.filterDoctorByTimeAndSpecility(speciality, time);
        } else if (hasSpeciality) {
            doctors = doctorService.filterDoctorBySpecility(speciality);
        } else if (hasTime) {
            doctors = doctorService.filterDoctorsByTime(time);
        } else if (hasName) {
            doctors = doctorService.findDoctorByName(name);
        } else {
            doctors = doctorService.getDoctors();
        }

        result.put("doctors", doctors);
        return result;
    }

    // Validates whether the requested appointment time for a doctor is available
    public int validateAppointment(Appointment appointment) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(appointment.getDoctor().getId());

        if (doctorOpt.isEmpty()) {
            return -1;
        }

        Doctor doctor = doctorOpt.get();
        List<String> availableSlots = doctorService.getDoctorAvailability(doctor.getId(), appointment.getAppointmentDate());

        String requestedTime = appointment.getAppointmentTimeOnly().toString();

        for (String slot : availableSlots) {
            String startTime = slot.split("-")[0].trim();
            if (startTime.equals(requestedTime)) {
                return 1;
            }
        }

        return 0;
    }

    // Checks whether a patient with the same email or phone already exists.
    // Returns true if the patient is NEW (valid for registration), false if a duplicate exists.
    public boolean validatePatient(Patient patient) {
        Patient existing = patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone());
        return existing == null;
    }

    // Validates patient login credentials
    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            Patient patient = patientRepository.findByEmail(login.getEmail());

            if (patient != null) {
                if (patient.getPassword().equals(login.getPassword())) {
                    String token = tokenService.generateToken(patient.getEmail());
                    response.put("token", token);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Invalid credentials");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            } else {
                response.put("message", "Patient not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Filters a patient's appointment history based on condition and/or doctor name
    @Transactional
    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        String email = tokenService.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email);

        boolean hasCondition = condition != null && !condition.equalsIgnoreCase("null");
        boolean hasName = name != null && !name.equalsIgnoreCase("null");

        if (hasCondition && hasName) {
            return patientService.filterByDoctorAndCondition(condition, name, patient.getId());
        } else if (hasCondition) {
            return patientService.filterByCondition(condition, patient.getId());
        } else if (hasName) {
            return patientService.filterByDoctor(name, patient.getId());
        } else {
            return patientService.getPatientAppointment(patient.getId());
        }
    }
}