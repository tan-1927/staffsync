# 7. Project Folder, Client Setup and Server Setup

## Folder structure

```
staffsync/
├── server/                      Express API
│   ├── config/db.js             MongoDB connection
│   ├── models/                  User, Leave, Attendance, Announcement, Training
│   ├── controllers/             auth, user, leave, attendance, announcement, training
│   ├── routes/                  one file per resource
│   ├── middleware/auth.js       protect + allow(role)
│   ├── seed.js                  demo data
│   ├── server.js                app entry point
│   └── .env.example
├── client/                      React app (Vite)
│   ├── src/
│   │   ├── api/axios.js         Axios instance + token interceptor
│   │   ├── context/             AuthContext (who is logged in)
│   │   ├── components/          Navbar, ProtectedRoute, PageShell, StatusBadge, DashboardTiles
│   │   ├── pages/               Login, Register, 3 dashboards, feature pages
│   │   ├── utils/format.js      date, time and money helpers
│   │   ├── App.jsx              routes
│   │   └── main.jsx             entry point
│   └── .env.example
├── docs/                        project documentation
└── README.md
```

## Server setup

```bash
mkdir server && cd server
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

Packages: `express` (web framework), `mongoose` (MongoDB models), `cors` (allow the frontend to call the API), `dotenv` (read `.env`), `bcryptjs` (hash passwords), `jsonwebtoken` (JWT), `nodemon` (auto-restart in development).

`server/.env`:
```
PORT=5001
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random string>
CLIENT_URL=http://localhost:5173
```

## Client setup

```bash
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom bootstrap
```

`client/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

Bootstrap is loaded once in `src/main.jsx` with `import "bootstrap/dist/css/bootstrap.min.css"`.
