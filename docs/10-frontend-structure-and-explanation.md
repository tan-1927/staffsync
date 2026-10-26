# 10. Frontend Structure and Development Explanation

Built with React 18 + Vite, React Router v6, Axios and Bootstrap 5.

## Structure

| Folder / file | Purpose |
|---------------|---------|
| `src/main.jsx` | Starts React, wraps the app in `BrowserRouter` and `AuthProvider`, loads Bootstrap |
| `src/App.jsx` | All routes. Each page is wrapped in `ProtectedRoute` with its allowed roles |
| `src/api/axios.js` | One Axios instance: base URL from `VITE_API_URL`, interceptor adds the JWT |
| `src/context/AuthContext.jsx` | Holds `user`, `login`, `register`, `logout`, and restores the session on refresh |
| `src/components/` | Reusable pieces: `Navbar`, `ProtectedRoute`, `PageShell`, `StatusBadge`, `DashboardTiles` |
| `src/pages/` | One file per screen |
| `src/utils/format.js` | Date, time (India), hours-worked and money formatters |

## Pages and routes

| Route | Page | Roles |
|-------|------|-------|
| `/login`, `/register` | Login, Register | public |
| `/hr`, `/manager`, `/employee` | Dashboards | HR, Manager, Employee |
| `/employees` | Employees | HR |
| `/leave-requests` | Leave requests | HR, Manager |
| `/leaves` | My leave | Employee, Manager |
| `/attendance` | My attendance | all |
| `/attendance-all` | Company attendance | HR |
| `/announcements` | Announcements | all (HR can post) |
| `/trainings` | Trainings | HR, Manager |
| `/my-trainings` | My trainings | Employee |
| `/profile` | Profile | all |

## Key ideas

**Auth context.** `AuthContext` is a React context, a shared box any component can read. On load it reads the token from `localStorage` and calls `/auth/me` to restore the user, so refreshing does not log you out.

**Protected routes.** `ProtectedRoute` shows a spinner while the session loads, redirects to `/login` if nobody is logged in, and sends users with the wrong role back to their own dashboard.

**Data loading pattern.** Each page keeps `loading`, `error` and `success` state with `useState`, loads data in `useEffect` with `async/await` Axios calls, and reloads the list after every change. Error messages come from the API's `msg` field.

**Forms.** Controlled inputs (`value` + `onChange`), browser validation (`required`, `minLength`, `type="date"`) plus the server's validation as the real check.

**Demo login buttons.** The login page has HR / Manager / Employee buttons that fill in the demo credentials, so a reviewer can test every role quickly.

**Styling.** Bootstrap classes only (cards, tables, badges, forms, grid), so the layout is responsive on phones.
