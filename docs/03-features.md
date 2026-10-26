# 3. Features

## Authentication and access control
- Sign up (creates an employee), sign in, sign out, stay signed in after refresh.
- JWT-based sessions that expire after 7 days.
- Role-based dashboards and protected routes for HR, Manager and Employee.

## HR
- **Employee management**: add, edit, search and delete people, set role, department, designation, salary, join date and reporting manager, reset passwords.
- **Leave approvals**: see every leave request (including managers') and approve or reject with a note.
- **Company attendance**: see who checked in on any date, with hours worked.
- **Announcements**: post and delete company news.
- **Training programs**: see every program.

## Manager
- **Leave requests**: approve or reject employee leave.
- **Training and development**: create programs, assign employees, change status (scheduled, completed, cancelled), edit and delete.
- Apply for own leave (approved by HR), mark attendance, read announcements.

## Employee
- **Leave**: apply (casual, sick, earned, unpaid), see status and reviewer notes, cancel while pending.
- **Attendance**: check in and check out, see the last 31 days with hours worked.
- **Profile**: view work record, edit name, phone and address.
- **Announcements**: read company news.
- **My trainings**: see programs assigned to them.

## Business rules
- Overlapping leave dates are blocked.
- Only pending leave can be reviewed or cancelled, and only once.
- Nobody can review their own leave. Managers only review employee leave.
- One check-in and one check-out per person per day (India time).
- Trainings can only be assigned to employees.
