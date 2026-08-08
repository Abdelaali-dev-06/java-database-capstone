## MySQL Database Design

### Table: patients
- id: INT, Primary Key, Auto Increment
- first_name: VARCHAR(50), Not Null
- last_name: VARCHAR(50), Not Null
- email: VARCHAR(100), Unique, Not Null
- phone: VARCHAR(20), Not Null
- password_hash: VARCHAR(255), Not Null
- date_of_birth: DATE
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: doctors
- id: INT, Primary Key, Auto Increment
- first_name: VARCHAR(50), Not Null
- last_name: VARCHAR(50), Not Null
- email: VARCHAR(100), Unique, Not Null
- phone: VARCHAR(20), Not Null
- password_hash: VARCHAR(255), Not Null
- specialization: VARCHAR(100), Not Null
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: admin
- id: INT, Primary Key, Auto Increment
- username: VARCHAR(50), Unique, Not Null
- password_hash: VARCHAR(255), Not Null
- email: VARCHAR(100), Unique, Not Null
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_time: DATETIME, Not Null
- duration_minutes: INT, Default 60
- status: INT (0 = Scheduled, 1 = Completed, 2 = Cancelled)
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: doctor_availability
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- start_time: DATETIME, Not Null
- end_time: DATETIME, Not Null
- is_available: BOOLEAN, Default TRUE

### Table: prescriptions_ref
- id: INT, Primary Key, Auto Increment
- appointment_id: INT, Foreign Key → appointments(id), Unique
- mongo_doc_id: VARCHAR(50), Not Null

Design decisions:
- appointment_id and doctor_id/patient_id foreign keys use ON DELETE RESTRICT rather than CASCADE, since appointment history should be retained for medical/legal records even if a patient or doctor record is later deleted or deactivated. A deleted_at or is_active soft-delete flag on patients and doctors is preferable to hard deletion.
- Doctors should not have overlapping appointments; this is enforced at the application layer by checking doctor_availability and existing appointments before insert, combined with a unique constraint on (doctor_id, appointment_time) as a safety net.
- Email and phone format validation is handled in application code, not the database, since regex validation in MySQL is limited.
- Prescriptions are tied to a specific appointment (via appointment_id) but stored in MongoDB since prescription content is variable and text-heavy; prescriptions_ref bridges the two databases.

## MongoDB Collection Design

### Collection: prescriptions

{
  "_id": "ObjectId('64abc123456')",
  "appointmentId": 51,
  "patientId": 12,
  "doctorId": 4,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "frequency": "Every 6 hours",
  "durationDays": 5,
  "doctorNotes": "Take with food. Avoid alcohol.",
  "refillCount": 2,
  "tags": ["pain-relief", "otc"],
  "pharmacy": {
    "name": "Walgreens SF",
    "location": "Market Street"
  },
  "createdAt": "2026-08-08T10:15:00Z"
}

### Collection: feedback

{
  "_id": "ObjectId('64def789012')",
  "appointmentId": 51,
  "patientId": 12,
  "doctorId": 4,
  "rating": 5,
  "comment": "Very attentive and explained everything clearly.",
  "tags": ["punctual", "friendly"],
  "submittedAt": "2026-08-08T11:00:00Z"
}

### Collection: logs

{
  "_id": "ObjectId('64ghi345678')",
  "eventType": "check_in",
  "patientId": 12,
  "appointmentId": 51,
  "metadata": {
    "location": "Front Desk",
    "device": "kiosk-02"
  },
  "timestamp": "2026-08-08T09:55:00Z"
}

### Collection: messages

{
  "_id": "ObjectId('64jkl901234')",
  "appointmentId": 51,
  "participants": {
    "patientId": 12,
    "doctorId": 4
  },
  "thread": [
    {
      "senderRole": "patient",
      "senderId": 12,
      "text": "Can I reschedule to next week?",
      "sentAt": "2026-08-07T14:00:00Z"
    },
    {
      "senderRole": "doctor",
      "senderId": 4,
      "text": "Sure, I have availability Tuesday afternoon.",
      "sentAt": "2026-08-07T14:20:00Z"
    }
  ],
  "lastUpdated": "2026-08-07T14:20:00Z"
}

Design decisions:
- MongoDB documents store only IDs (patientId, doctorId, appointmentId) rather than full embedded patient/doctor objects, keeping MySQL as the single source of truth for identity data and avoiding sync issues if a name or contact detail changes.
- The messages collection embeds the conversation thread as an array within a single document per appointment, since messages are naturally read together and rarely queried individually, avoiding excessive joins/lookups.
- Fields like tags and metadata are intentionally loose (arrays/nested objects) so the schema can evolve without migrations; new optional fields can be added to future documents without breaking older ones, since MongoDB does not enforce a rigid schema.
