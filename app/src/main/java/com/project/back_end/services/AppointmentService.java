package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final com.project.back_end.services.Service service;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              com.project.back_end.services.Service service,
                              TokenService tokenService,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Appointment> existingOpt = appointmentRepository.findById(appointment.getId());

            if (existingOpt.isEmpty()) {
                response.put("message", "Appointment not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment existing = existingOpt.get();

            if (!existing.getPatient().getId().equals(appointment.getPatient().getId())) {
                response.put("message", "You are not authorized to update this appointment");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            int validation = service.validateAppointment(appointment);
            if (validation == -1) {
                response.put("message", "Doctor not found");
                return ResponseEntity.badRequest().body(response);
            } else if (validation == 0) {
                response.put("message", "Doctor is not available at the requested time");
                return ResponseEntity.badRequest().body(response);
            }

            appointmentRepository.save(appointment);
            response.put("message", "Appointment updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "An error occurred while updating the appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(Long id, String token) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

            if (appointmentOpt.isEmpty()) {
                response.put("message", "Appointment not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment appointment = appointmentOpt.get();
            String patientEmail = tokenService.extractEmail(token);

            if (!appointment.getPatient().getEmail().equals(patientEmail)) {
                response.put("message", "You are not authorized to cancel this appointment");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            appointmentRepository.delete(appointment);
            response.put("message", "Appointment canceled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "An error occurred while canceling the appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public Map<String, Object> getAppointments(LocalDate date, String patientName, String token) {
        Map<String, Object> response = new HashMap<>();

        String doctorEmail = tokenService.extractEmail(token);
        Doctor doctor = doctorRepository.findByEmail(doctorEmail);

        if (doctor == null) {
            response.put("appointments", List.of());
            return response;
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<Appointment> appointments;
        if (patientName != null && !patientName.trim().isEmpty() && !patientName.equalsIgnoreCase("null")) {
            appointments = appointmentRepository
                    .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndLocalDateTimeBetween(
                            doctor.getId(), patientName, start, end);
        } else {
            appointments = appointmentRepository
                    .findByDoctorIdAndLocalDateTimeBetween(doctor.getId(), start, end);
        }

        // Convert raw entities into AppointmentDTO instances for the JSON response
        List<AppointmentDTO> dtoList = appointments.stream().map(app -> {
            int statusInt = 0;
            try {
                statusInt = Integer.parseInt(app.getStatus());
            } catch (Exception ignored) {}

            return new AppointmentDTO(
                    app.getId(),
                    app.getDoctor() != null ? app.getDoctor().getId() : null,
                    app.getDoctor() != null ? app.getDoctor().getName() : "",
                    app.getPatient() != null ? app.getPatient().getId() : null,
                    app.getPatient() != null ? app.getPatient().getName() : "",
                    app.getPatient() != null ? app.getPatient().getEmail() : "",
                    app.getPatient() != null ? app.getPatient().getPhone() : "",
                    app.getPatient() != null ? app.getPatient().getAddress() : "",
                    app.getLocalDateTime(),
                    statusInt
            );
        }).toList();

        response.put("appointments", dtoList);
        return response;
    }

    @Transactional
    public void changeStatus(Long appointmentId, int status) {
        appointmentRepository.updateStatus(status, appointmentId);
    }
}