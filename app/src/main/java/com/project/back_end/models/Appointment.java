package com.project.back_end.models;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManytoOne
    @NotNull
    private Doctor doctor;
    @ManytoOne
    @NotNull
    private Patient patient;
    @Future
    private LocalDateTime localDateTime:
    @NotNull
    private int status;

    public Appointment(Patient patient, Long id, Doctor doctor, LocalDateTime localDateTime, int status) {
        this.patient = patient;
        this.id = id;
        this.doctor = doctor;
        this.localDateTime = localDateTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public LocalDateTime getLocalDateTime() {
        return localDateTime;
    }

    public void setLocalDateTime(LocalDateTime localDateTime) {
        this.localDateTime = localDateTime;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    private LocalDateTime getEndTime() {
        return LocalDateTime.now().minusHours(1);
    }

    private LocalDate getAppointmentDate() {
        return LocalDate.now();
    }

    private LocalTime getAppointmentTimeOnly() {
        return LocalTime.now().minusHours(1);
    }
}

