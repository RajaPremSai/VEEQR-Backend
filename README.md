### VEEQR Backend (MERN)

Vehicle Entry/Exit using QR codes.

- Node.js + Express + MongoDB (Mongoose)
- QR signing with HMAC to prevent forgery
- CSV/PDF export of logs

Setup

1. Copy env.sample to .env and set values
2. Install deps and run

```bash
cd backend
npm install
npm run dev
```

Key Endpoints

- Auth: POST /api/auth/login
- Users (self): /api/users
- Manager: /api/manager
- Security Guard: /api/security-guards

Uploads

- Generated QR images stored in `uploads/qrcodes/` 