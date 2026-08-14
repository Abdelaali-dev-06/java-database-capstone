package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TokenService tokenService;

    // Helper to package responses into ResponseEntity<Map<String, Object>>
    private ResponseEntity<Map<String, Object>> createResponse(String key, Object data, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put(key, data);
        return new ResponseEntity<>(response, status);
    }

    // --- Authentication & Profile Methods ---

    public int createPatient(Patient patient) {
        if (patientRepository.findByEmail(patient.getEmail()) != null) {
            return 409;
        }
        patientRepository.save(patient);
        return 201;
    }

    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        String email = tokenService.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email);
        if (patient != null) {
            return createResponse("patient", patient, HttpStatus.OK);
        }
        return createResponse("message", "Patient not found", HttpStatus.NOT_FOUND);
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByEmail(String email) {
        return Optional.ofNullable(patientRepository.findByEmail(email));
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // --- Appointment Retrievals ---

    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return createResponse("appointments", appointments, HttpStatus.OK);
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // --- Filtering Methods ---

    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String doctorName, String condition, Long patientId) {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> appointments;
        if ("future".equalsIgnoreCase(condition) || "upcoming".equalsIgnoreCase(condition)) {
            appointments = appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCaseAndLocalDateTimeAfter(patientId, doctorName, now);
        } else if ("past".equalsIgnoreCase(condition)) {
            appointments = appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCaseAndLocalDateTimeBefore(patientId, doctorName, now);
        } else {
            appointments = appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCase(patientId, doctorName);
        }
        return createResponse("appointments", appointments, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long patientId) {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> appointments;
        if ("future".equalsIgnoreCase(condition) || "upcoming".equalsIgnoreCase(condition)) {
            appointments = appointmentRepository.findByPatientIdAndLocalDateTimeAfter(patientId, now);
        } else if ("past".equalsIgnoreCase(condition)) {
            appointments = appointmentRepository.findByPatientIdAndLocalDateTimeBefore(patientId, now);
        } else {
            appointments = appointmentRepository.findByPatientId(patientId);
        }
        return createResponse("appointments", appointments, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> filterByDoctor(String doctorName, Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCase(patientId, doctorName);
        return createResponse("appointments", appointments, HttpStatus.OK);
    }

    public List<Appointment> filterAppointmentsByDoctor(String doctorName, Long patientId) {
        return appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCase(patientId, doctorName);
    }

    public List<Appointment> filterAppointmentsByDoctorAndStatus(String doctorName, Long patientId, String status) {
        return appointmentRepository.findByPatientIdAndDoctor_NameContainingIgnoreCase(patientId, doctorName);
    }

    public List<Appointment> getAppointmentsByStatus(Long patientId, String status) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // --- Update & Delete ---

    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatient.getName());
            patient.setEmail(updatedPatient.getEmail());
            patient.setPhone(updatedPatient.getPhone());
            patient.setAddress(updatedPatient.getAddress());
            if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isEmpty()) {
                patient.setPassword(updatedPatient.getPassword());
            }
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}