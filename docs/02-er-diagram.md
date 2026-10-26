# 2. ER Diagram

![er-diagram](diagrams/er-diagram.png)

<details><summary>Diagram source (Mermaid)</summary>

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "bcrypt hash"
        string role "hr | manager | employee"
        string department
        string designation
        number salary
        date joinDate
        ObjectId manager FK "reports to (User)"
        string phone
        string address
    }
    LEAVE {
        ObjectId _id PK
        ObjectId user FK "who applied"
        string type "casual | sick | earned | unpaid"
        date fromDate
        date toDate
        string reason
        string status "pending | approved | rejected"
        ObjectId reviewedBy FK
        date reviewedAt
        string reviewNote
    }
    ATTENDANCE {
        ObjectId _id PK
        ObjectId user FK
        string date "YYYY-MM-DD, unique per user"
        date checkIn
        date checkOut
    }
    ANNOUNCEMENT {
        ObjectId _id PK
        string title
        string body
        ObjectId postedBy FK
    }
    TRAINING {
        ObjectId _id PK
        string title
        string description
        date date
        string status "scheduled | completed | cancelled"
        ObjectId[] assignedTo FK
        ObjectId createdBy FK
    }

    USER |o--o{ USER : "manages"
    USER ||--o{ LEAVE : "applies for"
    USER |o--o{ LEAVE : "reviews"
    USER ||--o{ ATTENDANCE : "marks"
    USER ||--o{ ANNOUNCEMENT : "posts (HR)"
    USER ||--o{ TRAINING : "creates (manager)"
    TRAINING }o--o{ USER : "assigned to (employees)"
```

</details>

## Relationships in words

- One user can have many leave requests, many attendance rows (one per day), and can post many announcements (HR) or create many trainings (manager).
- A user can report to one manager (`manager` points to another user).
- A training is assigned to many employees, and an employee can have many trainings.
- `ATTENDANCE` has a unique index on (`user`, `date`), so nobody can check in twice on the same day.
- When HR deletes a user, their leaves and attendance are deleted and they are removed from trainings.
