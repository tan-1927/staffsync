# 11. Steps for Project Execution

## Prerequisites
- Node.js v16 or above and npm v8 or above (check with `node -v` and `npm -v`)
- A MongoDB Atlas free cluster (see [09-database.md](09-database.md))
- Git, and a browser (Chrome, Firefox or Safari)

## 1. Get the code
```bash
git clone https://github.com/tan-1927/staffsync.git
cd staffsync
```

## 2. Start the backend
```bash
cd server
npm install
cp .env.example .env
```
Open `.env` and fill in `MONGO_URI` and `JWT_SECRET`. Then:
```bash
npm run seed     # creates demo users and sample data (run once)
npm run dev      # starts the API on http://localhost:5001
```
Expected: `MongoDB connected: ...` and `Server running on port 5001`. Opening http://localhost:5001 shows `{"msg":"StaffSync API is running"}`.

## 3. Start the frontend
In a second terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

## 4. Log in

Open http://localhost:5173 and use the demo buttons, or these accounts (password `Password@123`):

| Role | Email |
|------|-------|
| HR | hr@staffsync.com |
| Manager | manager@staffsync.com |
| Employee | employee1@staffsync.com |

## 5. Suggested walkthrough
1. **Employee**: apply for leave, check in, edit profile, open My trainings.
2. **Manager**: approve the employee's leave, create a training and assign it.
3. **HR**: approve the manager's leave, add a new employee, post an announcement, open Company attendance.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE ... 5000` | macOS uses port 5000 for AirPlay. This project uses 5001. |
| Login says "Cannot reach the server" | Backend not running, or `VITE_API_URL` is wrong. Restart `npm run dev` in `client` after editing `.env`. |
| `MongoDB connection failed` | Check `MONGO_URI`, the database user password, and that Atlas Network Access allows your IP. |
| CORS error in the browser | Add the frontend URL to `CLIENT_URL` in `server/.env` (comma-separated for several). |
