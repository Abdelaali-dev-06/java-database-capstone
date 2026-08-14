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

import com.project.back_end.models.Prescription;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${api.path:api/}prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final Service service;
    private final AppointmentService appointmentService;

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService,
                                  Service service,
                                  AppointmentService appointmentService) {
        this.prescriptionService = prescriptionService;
        this.service = service;
        this.appointmentService = appointmentService;
    }

    // Handles GET /prescription when accessed directly
    @GetMapping({"", "/"})
    public ResponseEntity<Map<String, String>> getPrescriptionInfo() {
        return ResponseEntity.ok(Map.of("message", "Prescription API active. Specify appointment ID and token to retrieve."));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @Valid @RequestBody Prescription prescription,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "doctor");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }

        appointmentService.changeStatus(prescription.getAppointmentId(), 1);

        return prescriptionService.savePrescription(prescription);
    }

    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable Long appointmentId,
            @PathVariable String token) {

        Map<String, Object> validation = service.validateToken(token, "doctor");
        if (!validation.isEmpty()) {
            return ResponseEntity.status(401).body(validation);
        }

        return prescriptionService.getPrescription(appointmentId);
    }
}