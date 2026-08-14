package com.project.back_end.repo;

import com.project.back_end.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // --- Patient Lookups ---
    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByPatient_Id(Long patientId);

    // --- Filter queries ---
    List<Appointment> findByPatientIdAndDoctor_NameContainingIgnoreCase(Long patientId, String doctorName);

    List<Appointment> findByPatientIdAndDoctor_NameContainingIgnoreCaseAndLocalDateTimeAfter(Long patientId, String doctorName, LocalDateTime now);

    List<Appointment> findByPatientIdAndDoctor_NameContainingIgnoreCaseAndLocalDateTimeBefore(Long patientId, String doctorName, LocalDateTime now);

    List<Appointment> findByPatientIdAndLocalDateTimeAfter(Long patientId, LocalDateTime now);

    List<Appointment> findByPatientIdAndLocalDateTimeBefore(Long patientId, LocalDateTime now);

    // --- Status Filter (String matching) ---
    List<Appointment> findByPatient_IdAndStatusOrderByLocalDateTimeAsc(Long patientId, String status);

    // Overload for int status using JPQL cast conversion
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = CAST(:status AS string) ORDER BY a.localDateTime ASC")
    List<Appointment> findByPatient_IdAndStatusOrderByLocalDateTimeAsc(@Param("patientId") Long patientId, @Param("status") int status);

    // --- Doctor & Appointment Service Queries ---
    List<Appointment> findByDoctorIdAndLocalDateTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    @Transactional
    @Modifying
    void deleteAllByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndPatient_NameContainingIgnoreCaseAndLocalDateTimeBetween(
            Long doctorId, String patientName, LocalDateTime start, LocalDateTime end);

    @Transactional
    @Modifying
    @Query("UPDATE Appointment a SET a.status = :status WHERE a.id = :id")
    void updateStatus(@Param("status") String status, @Param("id") Long id);

    @Transactional
    @Modifying
    @Query("UPDATE Appointment a SET a.status = CAST(:status AS string) WHERE a.id = :id")
    void updateStatus(@Param("status") int status, @Param("id") Long id);

    // --- Custom Query Helpers ---
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND LOWER(a.doctor.name) LIKE LOWER(CONCAT('%', :doctorName, '%'))")
    List<Appointment> filterByDoctorNameAndPatientId(@Param("doctorName") String doctorName, @Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND LOWER(a.doctor.name) LIKE LOWER(CONCAT('%', :doctorName, '%')) AND a.status = CAST(:status AS string)")
    List<Appointment> filterByDoctorNameAndPatientIdAndStatus(@Param("doctorName") String doctorName, @Param("patientId") Long patientId, @Param("status") int status);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND LOWER(a.doctor.name) LIKE LOWER(CONCAT('%', :doctorName, '%')) AND a.status = :status")
    List<Appointment> filterByDoctorNameAndPatientIdAndStatus(@Param("doctorName") String doctorName, @Param("patientId") Long patientId, @Param("status") String status);

    // Default aliases
    default List<Appointment> findByDoctorIdAndAppointmentTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end) {
        return findByDoctorIdAndLocalDateTimeBetween(doctorId, start, end);
    }

    default List<Appointment> findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
            Long doctorId, String patientName, LocalDateTime start, LocalDateTime end) {
        return findByDoctorIdAndPatient_NameContainingIgnoreCaseAndLocalDateTimeBetween(doctorId, patientName, start, end);
    }
}