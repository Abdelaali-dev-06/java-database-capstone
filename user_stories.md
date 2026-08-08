# User Story Template

**Title:**
_As a [user role], I want [feature/goal], so that [reason]._

**Acceptance Criteria:**
1. [Criteria 1]
2. [Criteria 2]
3. [Criteria 3]

**Priority:** [High/Medium/Low]
**Story Points:** [Estimated Effort in Points]
**Notes:**
- [Additional information or edge cases]

Title: As an admin, I want to log into the portal with my username and password, so that I can manage the platform securely.
Acceptance Criteria:
1. Login form accepts a valid username and password.
2. Invalid credentials display an appropriate error message.
3. Successful login redirects the admin to the admin dashboard.
Priority: High
Story Points: 3
Notes:
- Account should lock or throttle after multiple failed login attempts.
- Passwords must be stored securely (hashed, not plain text).

Title: As an admin, I want to log out of the portal, so that I can protect system access.
Acceptance Criteria:
1. A visible logout option is available from any admin page.
2. Logging out terminates the current session/token.
3. After logout, the admin is redirected to the login page and cannot access admin pages without re-authenticating.
Priority: Medium
Story Points: 1
Notes:
- Session should also expire automatically after a period of inactivity.

Title: As an admin, I want to add doctors to the portal, so that they can be listed and made available to patients.
Acceptance Criteria:
1. Admin can access a form to add a new doctor with required fields (name, specialization, contact info, credentials).
2. Required fields are validated before submission.
3. Newly added doctor appears in the doctor list/database upon success.
Priority: High
Story Points: 3
Notes:
- Consider whether the doctor receives an email/invite to set up their own login.

Title: As an admin, I want to delete a doctor's profile from the portal, so that inactive or removed doctors are no longer listed.
Acceptance Criteria:
1. Admin can select a doctor and initiate deletion.
2. System prompts for confirmation before deleting.
3. Deleted doctor no longer appears in patient-facing doctor listings.
Priority: Medium
Story Points: 2
Notes:
- Decide how existing/past appointments tied to a deleted doctor are handled (archive vs. cascade delete).

Title: As an admin, I want to run a stored procedure in the MySQL CLI to get the number of appointments per month, so that I can track usage statistics.
Acceptance Criteria:
1. A stored procedure exists that returns appointment counts grouped by month.
2. Admin can execute the procedure via MySQL CLI and receive accurate results.
3. Output is easy to read (e.g., month and count columns).
Priority: Low
Story Points: 2
Notes:
- Consider exposing this later via an admin dashboard report instead of requiring direct CLI access.

Title: As a patient, I want to view a list of doctors without logging in, so that I can explore options before registering.
Acceptance Criteria:
1. Doctor list is publicly accessible without authentication.
2. List displays basic details (name, specialization).
3. Booking or contact actions prompt the patient to sign up/log in.
Priority: High
Story Points: 2
Notes:
- Sensitive doctor info (e.g., contact details) may be restricted to logged-in users only.

Title: As a patient, I want to sign up using my email and password, so that I can book appointments.
Acceptance Criteria:
1. Signup form requires a valid, unique email and a password meeting complexity requirements.
2. Duplicate email registration is rejected with a clear error.
3. Successful signup creates a patient account and logs the patient in (or prompts them to log in).
Priority: High
Story Points: 3
Notes:
- Consider email verification before account activation.

Title: As a patient, I want to log into the portal, so that I can manage my bookings.
Acceptance Criteria:
1. Login form accepts a valid email and password.
2. Invalid credentials show an appropriate error message.
3. Successful login redirects to the patient dashboard.
Priority: High
Story Points: 2
Notes:
- Include a "forgot password" recovery flow.

Title: As a patient, I want to log out of the portal, so that I can secure my account.
Acceptance Criteria:
1. A visible logout option is available from any patient page.
2. Logging out ends the current session.
3. After logout, the patient is redirected to the homepage/login page.
Priority: Medium
Story Points: 1
Notes:
- Session should expire automatically after inactivity.

Title: As a patient, I want to log in and book an hour-long appointment, so that I can consult with a doctor.
Acceptance Criteria:
1. Logged-in patient can select a doctor and view available time slots.
2. Patient can book a one-hour slot, and the slot becomes unavailable to others once booked.
3. Confirmation is shown/sent to the patient upon successful booking.
Priority: High
Story Points: 5
Notes:
- Handle conflicts if two patients attempt to book the same slot simultaneously.
- Appointment duration should be configurable in case it changes from one hour in the future.

Title: As a patient, I want to view my upcoming appointments, so that I can prepare accordingly.
Acceptance Criteria:
1. Logged-in patient can view a list of upcoming appointments with date, time, and doctor details.
2. Past/completed appointments are not shown in the "upcoming" list.
3. Patient can view appointments in chronological order.
Priority: Medium
Story Points: 2
Notes:
- Consider adding cancel/reschedule options in a future iteration.

Title: As a doctor, I want to log into the portal, so that I can manage my appointments.
Acceptance Criteria:
1. Login form accepts a valid username/email and password.
2. Invalid credentials display an appropriate error message.
3. Successful login redirects to the doctor dashboard.
Priority: High
Story Points: 2
Notes:
- Doctor accounts are likely created by an admin, not self-registered.

Title: As a doctor, I want to log out of the portal, so that I can protect my data.
Acceptance Criteria:
1. A visible logout option is available from any doctor page.
2. Logging out ends the current session.
3. After logout, the doctor is redirected to the login page.
Priority: Medium
Story Points: 1
Notes:
- Session should expire automatically after inactivity.

Title: As a doctor, I want to view my appointment calendar, so that I can stay organized.
Acceptance Criteria:
1. Doctor can view appointments in a calendar or list view.
2. Calendar clearly shows date, time, and patient for each appointment.
3. Calendar updates in real time (or near real time) as new appointments are booked.
Priority: High
Story Points: 3
Notes:
- Consider daily/weekly/monthly view toggles.

Title: As a doctor, I want to mark my unavailability, so that patients only see the slots I'm actually available for.
Acceptance Criteria:
1. Doctor can select and mark specific dates/times as unavailable.
2. Marked unavailable slots do not appear as bookable to patients.
3. Existing booked appointments in a newly marked-unavailable slot trigger a warning/conflict notice.
Priority: High
Story Points: 3
Notes:
- Consider supporting recurring unavailability (e.g., every Friday afternoon).

Title: As a doctor, I want to update my profile with specialization and contact information, so that patients have up-to-date information.
Acceptance Criteria:
1. Doctor can edit profile fields including specialization and contact details.
2. Changes are validated (e.g., valid phone/email format) before saving.
3. Updated profile is immediately reflected in the patient-facing doctor list.
Priority: Medium
Story Points: 2
Notes:
- Consider whether profile changes require admin approval.

Title: As a doctor, I want to view patient details for upcoming appointments, so that I can be prepared.
Acceptance Criteria:
1. Doctor can select an upcoming appointment and view relevant patient details.
2. Only patient information relevant to the doctor's care is shown (privacy-appropriate).
3. Details are accessible directly from the appointment calendar/list.
Priority: Medium
Story Points: 2
Notes:
- Ensure compliance with patient data privacy regulations (e.g., HIPAA or local equivalent).
