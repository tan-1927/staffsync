# 4. Roles and Responsibilities

| Capability | HR | Manager | Employee |
|-----------|:--:|:-------:|:--------:|
| Sign in, view own profile, edit own contact details | Yes | Yes | Yes |
| Mark own attendance, see own history | Yes | Yes | Yes |
| Read announcements | Yes | Yes | Yes |
| Post / delete announcements | Yes | - | - |
| Add / edit / delete people, set roles and salary | Yes | - | - |
| View company-wide attendance | Yes | - | - |
| Apply for leave | - | Yes | Yes |
| Approve / reject employee leave | Yes | Yes | - |
| Approve / reject manager leave | Yes | - | - |
| Create and manage trainings | Yes (all) | Yes (own) | - |
| See assigned trainings | - | - | Yes |

## Responsibilities

- **HR** owns people data and company communication. HR is the final authority on leave and the only role that can create or change accounts.
- **Manager** looks after the team's day-to-day: leave decisions for employees and development programs.
- **Employee** keeps their own information current and uses self-service for leave, attendance and learning.

## How it is enforced

Server side, in `server/middleware/auth.js`:
- `protect` rejects requests with no valid token (401).
- `allow("hr", "manager")` rejects the wrong role (403).

Client side, `ProtectedRoute` redirects to the login page, or to the user's own dashboard if the role does not match. The server rules are the real protection.
