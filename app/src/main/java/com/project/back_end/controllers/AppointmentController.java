package com.project.back_end.controllers;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final Service service;

    @Autowired
    public AppointmentController(AppointmentService appointmentService, Service service) {
        this.appointmentService = appointmentService;
        this.service = service;
    }

    // Handles GET /appointments when accessed without subpaths
    @GetMapping({"", "/"})
    public ResponseEntity<Map<String, String>> getAppointmentsInfo() {
        return ResponseEntity.ok(Map.of("message", "Appointments API is running. Specify path variables to fetch appointments."));
    }

    // 3. getAppointments: fetch appointments by date and patient name (doctor role)
    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable LocalDate date,
            @PathVariable String patientName,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "doctor");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return ResponseEntity.ok(appointmentService.getAppointments(date, patientName, token));
    }

    // 4. bookAppointment: create a new appointment (patient role)
    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @Valid @RequestBody Appointment appointment,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "patient");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        int result = appointmentService.bookAppointment(appointment);

        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Appointment booked successfully"));
        } else if (result == -1) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid doctor ID"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "The selected time slot is already taken"));
        }
    }

    // 5. updateAppointment: modify an existing appointment (patient role)
    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @Valid @RequestBody Appointment appointment,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "patient");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        return appointmentService.updateAppointment(appointment);
    }

    // 6. cancelAppointment: cancel an existing appointment (patient role)
    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "patient");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        return appointmentService.cancelAppointment(id, token);
    }
}