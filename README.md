# StaffSync

Modern human resource management solution built with the MERN stack (MongoDB, Express, React, Node).

HR, managers and employees each get role-based access:

- **HR**: manage employees, approve leave, view company attendance, post announcements
- **Manager**: review team leave, create and assign training programs
- **Employee**: apply for leave, mark attendance, edit profile, read announcements, see assigned trainings

## Tech stack

React 18 (Vite) · Bootstrap 5 · React Router · Axios · Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt

## Quick start

Requirements: Node.js v16+, npm v8+, a MongoDB Atlas cluster (or local MongoDB).

```bash
# Backend
cd server
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # one time: demo users and sample data
npm run dev               # http://localhost:5001

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Demo credentials

Password for all: `Password@123`

| Role | Email |
|------|-------|
| HR | hr@staffsync.com |
| Manager | manager@staffsync.com |
| Employee | employee1@staffsync.com |
| Employee | employee2@staffsync.com |

## Documentation

1. [Technical architecture](docs/01-technical-architecture.md)
2. [ER diagram](docs/02-er-diagram.md)
3. [Features](docs/03-features.md)
4. [Roles and responsibilities](docs/04-roles-and-responsibilities.md)
5. [User flow](docs/05-user-flow.md)
6. [MVC pattern](docs/06-mvc-pattern.md)
7. [Project folder, client and server setup](docs/07-project-folder-and-setup.md)
8. [Backend structure and explanation (API reference)](docs/08-backend-structure-and-explanation.md)
9. [Database: MongoDB, connection, schemas](docs/09-database.md)
10. [Frontend structure and explanation](docs/10-frontend-structure-and-explanation.md)
11. [Steps for project execution](docs/11-steps-for-project-execution.md)
12. [Deployment](docs/12-deployment.md)

## Screenshots

See the `screenshots/` folder.

## Live links

- Demo: _add after deploying_
- GitHub: https://github.com/tan-1927/staffsync
