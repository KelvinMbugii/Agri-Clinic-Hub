# Agri-Clinic Hub — Frontend (Client)

React (Vite) + Tailwind CSS frontend for Agri-Clinic Hub with role-based routing (farmer / officer / admin) using JWT.

## Setup

1. Install dependencies:

```bash
cd "c:\Users\user\FinalProject\Agri-Clinic-Hub-Test\Agri-Clinic-Hub\client"
npm install
```

2. Configure API base URL:

- Copy `.env.example` to `.env`
- Set `VITE_API_BASE_URL` (default backend: `http://localhost:5000`)

3. Run the dev server:

```bash
npm run dev
```

## Auth flow

- JWT is stored in `localStorage` under `ach_token`
- The app decodes the JWT payload to infer role; if role is not present in the payload, it falls back to the `user.role` returned by the auth response.
- Role redirects:
  - farmer → `/farmer/dashboard`
  - officer → `/officer/dashboard`
  - admin → `/admin/dashboard`

