# 12. Deployment (for the demo link)

Three free services: MongoDB Atlas (database), Render (API) and Vercel (frontend).

## Before you deploy
- In Atlas, **Database Access**: reset the database user's password and update `MONGO_URI`.
- In Atlas, **Network Access**: allow `0.0.0.0/0`.
- Push your latest code to GitHub.

## 1. Backend on Render
1. render.com > **New > Web Service** > connect your GitHub repo.
2. Root Directory: `server`. Build Command: `npm install`. Start Command: `node server.js`. Instance type: Free.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (you will set this after step 2; use `http://localhost:5173` for now).
4. Deploy. Your API URL looks like `https://staffsync-api.onrender.com`. Opening it should show `{"msg":"StaffSync API is running"}`.

## 2. Frontend on Vercel
1. vercel.com > **Add New > Project** > import the same repo.
2. Root Directory: `client`. Framework preset: Vite.
3. Environment variable: `VITE_API_URL` = `https://<your-render-url>/api`.
4. Deploy. Your site URL looks like `https://staffsync.vercel.app`.

## 3. Connect them
Back in Render, edit `CLIENT_URL` to your Vercel URL (no trailing slash). To allow both local and live: `http://localhost:5173,https://staffsync.vercel.app`. Render redeploys automatically.

## 4. Seed the live database
From your laptop, with `server/.env` pointing at the same Atlas database:
```bash
cd server
npm run seed
```

## 5. Page refresh on Vercel
`client/vercel.json` makes direct links like `/hr` work after a refresh:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

## 6. Submit
Paste the Vercel URL as the **Demo link** and the GitHub URL as the **GitHub link**.

## Notes
- Render's free tier sleeps after inactivity, so the first request can take about 50 seconds. Open the site once before showing it to your mentor.
- Record a 2 to 3 minute demo video as a backup (the "Demo Video" task).
