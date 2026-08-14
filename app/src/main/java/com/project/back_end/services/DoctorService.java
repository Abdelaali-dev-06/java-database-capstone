package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository,
                         AppointmentRepository appointmentRepository,
                         TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    // Retrieves available time slots for a doctor on a given date, filtering out booked slots
    @Transactional
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);

        if (doctorOpt.isEmpty()) {
            return new ArrayList<>();
        }

        Doctor doctor = doctorOpt.get();
        List<String> allSlots = doctor.getAvailableTimes();

        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(
                        doctorId,
                        date.atStartOfDay(),
                        date.atTime(23, 59, 59));

        List<String> bookedTimes = new ArrayList<>();
        for (Appointment appt : bookedAppointments) {
            bookedTimes.add(appt.getAppointmentTimeOnly().toString());
        }

        List<String> availableSlots = new ArrayList<>();
        if (allSlots != null) {
            for (String slot : allSlots) {
                String startTime = slot.split("-")[0].trim();
                if (!bookedTimes.contains(startTime)) {
                    availableSlots.add(slot);
                }
            }
        }

        return availableSlots;
    }

    // Saves a new doctor after checking for an existing email
    public int saveDoctor(Doctor doctor) {
        try {
            if (doctor.getEmail() != null) {
                doctor.setEmail(doctor.getEmail().trim().toLowerCase());
            }
            if (doctorRepository.findByEmail(doctor.getEmail()) != null) {
                return -1;
            }
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // Updates an existing doctor's details
    public int updateDoctor(Doctor doctor) {
        try {
            if (!doctorRepository.existsById(doctor.getId())) {
                return -1;
            }
            if (doctor.getEmail() != null) {
                doctor.setEmail(doctor.getEmail().trim().toLowerCase());
            }
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // Fetches all doctors, forcing availableTimes to load while the transaction is still open
    @Transactional
    public List<Doctor> getDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();

        for (Doctor doctor : doctors) {
            if (doctor.getAvailableTimes() != null) {
                doctor.getAvailableTimes().size();
            }
        }

        return doctors;
    }

    // Deletes a doctor along with their associated appointments
    @Transactional
    public int deleteDoctor(Long id) {
        try {
            if (!doctorRepository.existsById(id)) {
                return -1;
            }
            appointmentRepository.deleteAllByDoctorId(id);
            doctorRepository.deleteById(id);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // Validates a doctor's login and generates a token on success
    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            if (login == null || login.getEmail() == null || login.getPassword() == null) {
                response.put("message", "Email and password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Clean inputs
            String rawEmail = login.getEmail().trim().toLowerCase();
            String rawPassword = login.getPassword().trim();

            Doctor doctor = doctorRepository.findByEmail(rawEmail);

            // Fallback lookup if exact casing in DB differs
            if (doctor == null) {
                List<Doctor> allDoctors = doctorRepository.findAll();
                for (Doctor d : allDoctors) {
                    if (d.getEmail() != null && d.getEmail().trim().equalsIgnoreCase(rawEmail)) {
                        doctor = d;
                        break;
                    }
                }
            }

            if (doctor != null) {
                String dbPassword = doctor.getPassword() != null ? doctor.getPassword().trim() : "";

                if (dbPassword.equals(rawPassword)) {
                    if (tokenService == null) {
                        response.put("message", "Server configuration error: TokenService is null");
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                    }

                    String token = tokenService.generateToken(doctor.getEmail());
                    response.put("token", token);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Invalid password");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            } else {
                response.put("message", "Doctor email not found in database");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public List<Doctor> findDoctorByName(String name) {
        return doctorRepository.findByNameLike(name);
    }

    public List<Doctor> filterDoctorsByNameSpecilityandTime(String name, String speciality, String time) {
        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialityIgnoreCase(name, speciality);
        return filterDoctorByTime(doctors, time);
    }

    public List<Doctor> filterDoctorByTime(List<Doctor> doctors, String time) {
        List<Doctor> filtered = new ArrayList<>();

        for (Doctor doctor : doctors) {
            if (doctor.getAvailableTimes() == null) continue;

            for (String slot : doctor.getAvailableTimes()) {
                String startTimeStr = slot.split("-")[0].trim();
                LocalTime startTime = LocalTime.parse(startTimeStr);
                boolean isAM = startTime.isBefore(LocalTime.NOON);

                if ((time.equalsIgnoreCase("AM") && isAM) || (time.equalsIgnoreCase("PM") && !isAM)) {
                    filtered.add(doctor);
                    break;
                }
            }
        }

        return filtered;
    }

    public List<Doctor> filterDoctorByNameAndTime(String name, String time) {
        List<Doctor> doctors = doctorRepository.findByNameLike(name);
        return filterDoctorByTime(doctors, time);
    }

    public List<Doctor> filterDoctorByNameAndSpecility(String name, String speciality) {
        return doctorRepository.findByNameContainingIgnoreCaseAndSpecialityIgnoreCase(name, speciality);
    }

    public List<Doctor> filterDoctorByTimeAndSpecility(String speciality, String time) {
        List<Doctor> doctors = doctorRepository.findBySpecialityIgnoreCase(speciality);
        return filterDoctorByTime(doctors, time);
    }

    public List<Doctor> filterDoctorBySpecility(String speciality) {
        return doctorRepository.findBySpecialityIgnoreCase(speciality);
    }

    public List<Doctor> filterDoctorsByTime(String time) {
        List<Doctor> doctors = doctorRepository.findAll();
        return filterDoctorByTime(doctors, time);
    }
}