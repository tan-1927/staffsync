# 9. Database: MongoDB Configuration, Connection, Schemas and Models

## Configure MongoDB (Atlas)

1. Create a free account at mongodb.com/cloud/atlas and a free **M0** cluster (region: Mumbai).
2. **Database Access**: create a database user with a username and password.
3. **Network Access**: allow access from anywhere (`0.0.0.0/0`) so the deployed backend can connect.
4. **Connect > Drivers**: copy the connection string, put your password in it, and add the database name `staffsync` after the host:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/staffsync?retryWrites=true&w=majority
```

Store it as `MONGO_URI` in `server/.env`. Never commit it.

## Database connection: `server/config/db.js`

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
```

`server.js` calls `connectDB()` first and starts listening only after it succeeds.

## Schemas and models (`server/models/`)

A **schema** describes the fields and rules, and a **model** is the object we use to query a collection.

| Model | Collection | Notable rules |
|-------|-----------|---------------|
| `User` | `users` | unique lowercase email, password min 6 and hidden by default, role enum, bcrypt hook |
| `Leave` | `leaves` | type and status enums, reason max 500, virtual `days` computed from the two dates |
| `Attendance` | `attendances` | `date` string, unique index on (`user`, `date`) |
| `Announcement` | `announcements` | title max 120, body max 2000 |
| `Training` | `trainings` | status enum, `assignedTo` is an array of user ids |

Relationships use `ObjectId` references with `ref`, and controllers use `.populate()` to swap an id for the person's name when needed. All schemas use `timestamps: true`, which adds `createdAt` and `updatedAt`.

See [02-er-diagram.md](02-er-diagram.md) for the full diagram.

## Seed data

`npm run seed` (in `server/`) wipes and recreates the demo users and their sample leave, attendance, announcements and trainings. Password for all demo accounts: `Password@123`.
