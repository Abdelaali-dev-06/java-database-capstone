package com.project.back_end.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.path:api/}doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    private final Service service;

    @Autowired
    public DoctorController(DoctorService doctorService, Service service) {
        this.doctorService = doctorService;
        this.service = service;
    }

    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable LocalDate date,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, user);
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return ResponseEntity.ok(Map.of("availability", doctorService.getDoctorAvailability(doctorId, date)));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctor() {
        return ResponseEntity.ok(Map.of("doctors", doctorService.getDoctors()));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(
            @Valid @RequestBody Doctor doctor,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "admin");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        int result = doctorService.saveDoctor(doctor);

        if (result == -1) {
            return ResponseEntity.status(409).body(Map.of("message", "Doctor already exists"));
        } else if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor added successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("message", "An error occurred while adding the doctor"));
        }
    }

    // Handles GET /doctor/login cleanly
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLoginGet() {
        return ResponseEntity.ok(Map.of("message", "Doctor login endpoint active. Send POST request to login."));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody Login login) {
        try {
            return doctorService.validateDoctor(login);
        } catch (Exception e) {
            Map<String, String> errResponse = new HashMap<>();
            errResponse.put("message", "Server error during doctor login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResponse);
        }
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(
            @Valid @RequestBody Doctor doctor,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "admin");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        int result = doctorService.updateDoctor(doctor);

        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor updated successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Doctor not found"));
        }
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(
            @PathVariable Long id,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "admin");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        int result = doctorService.deleteDoctor(id);

        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Doctor not found"));
        }
    }

    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, Object>> filter(
            @PathVariable String name,
            @PathVariable String time,
            @PathVariable String speciality) {

        return ResponseEntity.ok(service.filterDoctor(name, time, speciality));
    }
}