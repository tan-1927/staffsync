# 5. User Flow

## Overall flow

```mermaid
flowchart TD
    A[Open app] --> B{Logged in?}
    B -- No --> C[Login / Sign up]
    C --> D{Role}
    B -- Yes --> D
    D -- HR --> H[HR dashboard]
    D -- Manager --> M[Manager dashboard]
    D -- Employee --> E[Employee dashboard]

    H --> H1[Employees]
    H --> H2[Leave approvals]
    H --> H3[Company attendance]
    H --> H4[Announcements]
    H --> H5[Trainings]

    M --> M1[Leave requests]
    M --> M2[Trainings]
    M --> M3[My leave / attendance]

    E --> E1[Apply for leave]
    E --> E2[Mark attendance]
    E --> E3[Profile]
    E --> E4[Announcements]
    E --> E5[My trainings]
```

![user flow](diagrams/user-flow.png)

## Leave flow

```mermaid
sequenceDiagram
    participant E as Employee
    participant API as StaffSync API
    participant M as Manager
    participant HR as HR
    E->>API: POST /api/leaves (type, dates, reason)
    API-->>E: 201, status = pending
    M->>API: GET /api/leaves?status=pending
    M->>API: PATCH /api/leaves/:id {approved | rejected, note}
    API-->>E: status and note visible on My Leave
    Note over HR,API: A manager's own leave is decided by HR
```

![leave sequence](diagrams/leave-sequence.png)

## Attendance flow

1. Employee opens **Attendance** and clicks **Check in** (one per day).
2. At the end of the day they click **Check out**.
3. HR opens **Company attendance**, picks a date and sees everyone's times and hours.

## Training flow

1. Manager creates a training: title, date, description, selects employees.
2. Selected employees see it under **My trainings**.
3. Manager updates the status to completed or cancelled when it is done.
