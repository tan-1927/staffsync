# 8. Backend Structure and Development Explanation

## Entry point: `server/server.js`

1. Loads `.env` with dotenv.
2. Creates the Express app, enables CORS for the origins in `CLIENT_URL`, and parses JSON bodies.
3. Mounts the routers under `/api/...`.
4. Adds a basic error handler.
5. Connects to MongoDB, then starts listening on `PORT`.

## API reference

All routes except register and login need `Authorization: Bearer <token>`.

### Auth (`/api/auth`)
| Method | Path | Who | What |
|--------|------|-----|------|
| POST | `/register` | public | Create an employee account |
| POST | `/login` | public | Returns `{ token, user }` |
| GET | `/me` | any | Current user |

### Users (`/api/users`)
| Method | Path | Who | What |
|--------|------|-----|------|
| GET | `/` | HR | All people with HR record |
| GET | `/team` | HR, Manager | Employees only, no salary (for dropdowns) |
| POST | `/` | HR | Add a person |
| PUT | `/:id` | HR | Edit a person, optional password reset |
| DELETE | `/:id` | HR | Delete a person and their records |
| GET / PUT | `/me/profile` | any | Read / edit own name, phone, address |

### Leaves (`/api/leaves`)
| Method | Path | Who | What |
|--------|------|-----|------|
| POST | `/` | Employee, Manager | Apply |
| GET | `/me` | Employee, Manager | My requests |
| GET | `/?status=` | HR, Manager | All (HR) or employees' (Manager) |
| PATCH | `/:id` | HR, Manager | Approve or reject |
| DELETE | `/:id` | Employee, Manager | Cancel own pending request |

### Attendance (`/api/attendance`)
| Method | Path | Who | What |
|--------|------|-----|------|
| POST | `/check-in`, `/check-out` | any | Mark today |
| GET | `/today`, `/me` | any | Today's record, last 31 days |
| GET | `/?date=YYYY-MM-DD` | HR | Everyone on a date |

### Announcements (`/api/announcements`)
| Method | Path | Who | What |
|--------|------|-----|------|
| GET | `/` | any | List, newest first |
| POST | `/` | HR | Post |
| DELETE | `/:id` | HR | Delete |

### Trainings (`/api/trainings`)
| Method | Path | Who | What |
|--------|------|-----|------|
| GET | `/me` | any | Assigned to me |
| GET | `/` | HR, Manager | All (HR) or own (Manager) |
| POST | `/` | HR, Manager | Create |
| PUT / DELETE | `/:id` | creator or HR | Edit / delete |

## Key code walkthrough

**Password hashing** (`models/User.js`): a `pre("save")` hook hashes the password with bcrypt whenever it changes.

**Token creation** (`controllers/authController.js`): `jwt.sign({ id, role, name }, JWT_SECRET, { expiresIn: "7d" })`.

**Guards** (`middleware/auth.js`): `protect` verifies the token and sets `req.user`. `allow(...roles)` compares `req.user.role` with the allowed list.

**Business rules** live in controllers, for example `leaveController.reviewLeave` refuses to review your own leave, a non-pending request, or (for managers) a non-employee's leave.

**Validation**: every controller checks types and formats before touching the database and returns a clear 400/404/409 message.

Status codes used: 200 OK, 201 Created, 400 bad input, 401 not logged in, 403 wrong role, 404 not found, 409 conflict (duplicate or already decided).
