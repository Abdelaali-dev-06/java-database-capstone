## MySQL Database Design

### Table: patients
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(100), Not Null
- email: VARCHAR(100), Unique, Not Null
- password: VARCHAR(255), Not Null
- phone: VARCHAR(10), Not Null
- address: VARCHAR(255), Not Null

### Table: doctors
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(100), Not Null
- specialty: VARCHAR(50), Not Null
- email: VARCHAR(100), Unique, Not Null
- password: VARCHAR(255), Not Null
- phone: VARCHAR(10), Not Null
- available_times: TEXT (stores list of available time slots)

### Table: admin
- id: INT, Primary Key, Auto Increment
- username: VARCHAR(50), Unique, Not Null
- password: VARCHAR(255), Not Null
- email: VARCHAR(100), Unique, Not Null

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_time: DATETIME, Not Null
- status: INT (0 = Scheduled, 1 = Completed, 2 = Cancelled)

Design decisions:
- doctor_id and patient_id foreign keys use ON DELETE RESTRICT rather than CASCADE, since appointment history should be retained even if a patient or doctor record is later deleted or deactivated.
- Doctors should not have overlapping appointments; this is enforced at the application layer by checking available_times and existing appointments before insert, combined with a unique constraint on (doctor_id, appointment_time) as a safety net.
- Email and phone format validation is handled in application code via annotations (@Email, @Pattern), not the database.
- appointment_time must be a future date/time at creation, enforced in application code.

## MongoDB Collection Design

### Collection: prescriptions

{
  "_id": "64abc123456",
  "appointmentId": 51,
  "patientName": "John Smith",
  "medication": "Paracetamol",
  "doctorNotes": "Take 1 tablet every 6 hours."
}

Design decisions:
- The prescriptions collection stores patientName directly instead of a patient reference, since prescriptions are printable/exportable records that should remain readable even if the patient record changes or is removed later.
- doctorNotes is kept as free text since notes vary in length and structure and don't need rigid validation.
- appointmentId links back to the MySQL appointments table, keeping MySQL as the source of truth for the relational structure while MongoDB handles the flexible content.
