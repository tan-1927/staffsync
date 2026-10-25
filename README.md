# StaffSync

Modern human resource management solution built with the MERN stack (MongoDB, Express, React, Node).

HR, managers and employees each get their own role-based access:

- **HR**: manage employee data, approve leaves, track attendance, post announcements
- **Manager**: review team leave requests, manage training and development programs
- **Employee**: apply for leave, mark attendance, maintain personal records, read announcements

## Tech stack

React (Vite) · Bootstrap · React Router · Axios · Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt

## Local setup

Requirements: Node.js v16+, npm v8+, a MongoDB Atlas cluster (or local MongoDB).

```bash
# 1. Backend
cd server
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # one time: creates demo accounts
npm run dev               # http://localhost:5001

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Demo credentials

Run `npm run seed` inside `server/` to create these accounts. Password for all: `Password@123`

| Role | Email |
|------|-------|
| HR | hr@staffsync.com |
| Manager | manager@staffsync.com |
| Employee | employee1@staffsync.com |
| Employee | employee2@staffsync.com |

## Live links

- Demo: _add after deploying_
- GitHub: _add your repo link_
