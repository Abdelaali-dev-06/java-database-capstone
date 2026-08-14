package com.project.back_end.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.PatientService;
import com.project.back_end.services.Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/patient")
public class PatientController {

    private final PatientService patientService;
    private final Service service;

    @Autowired
    public PatientController(PatientService patientService, Service service) {
        this.patientService = patientService;
        this.service = service;
    }

    // Handles GET /patient when accessed directly
    @GetMapping({"", "/"})
    public ResponseEntity<Map<String, String>> getPatientInfo() {
        return ResponseEntity.ok(Map.of("message", "Patient API is active. Send POST to register or login."));
    }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPatient(@PathVariable String token) {
        Map<String, Object> validation = service.validateToken(token, "patient");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return patientService.getPatientDetails(token);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createPatient(@Valid @RequestBody Patient patient) {
        boolean isNewPatient = service.validatePatient(patient);

        if (!isNewPatient) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "Patient with this email or phone already exists"));
        }

        int result = patientService.createPatient(patient);

        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Patient registered successfully"));
        } else {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "An error occurred while registering the patient"));
        }
    }

    // Handles GET /patient/login cleanly
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginGet() {
        return ResponseEntity.ok(Map.of("message", "Patient login endpoint active. Send POST request to login."));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody Login login) {
        return service.validatePatientLogin(login);
    }

    @GetMapping("/{id}/{token}/{user}")
    public ResponseEntity<Map<String, Object>> getPatientAppointment(
            @PathVariable Long id,
            @PathVariable String token,
            @PathVariable String user) {

        Map<String, Object> validation = service.validateToken(token, user);
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return patientService.getPatientAppointment(id);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, Object>> filterPatientAppointment(
            @PathVariable String condition,
            @PathVariable String name,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "patient");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return service.filterPatient(condition, name, token);
    }
}