# BookFlow

_Smart booking for service businesses_ — Upwork portfolio demo.

React + Flask app for service businesses (salons, clinics, consultants). A client requests a time slot, an admin assigns staff and confirms, staff marks the job done, and the client leaves a review.

## What it does

| Step | Who    | Action                                                     |
| ---- | ------ | ---------------------------------------------------------- |
| 1    | Client | Picks service + available slot → `pending`                 |
| 2    | Admin  | Assigns staff member + confirms → `confirmed`              |
| 3    | Staff  | Marks job as finished → `completed`                        |
| 4    | Client | Rates (1–5) + optional comment via magic link → `reviewed` |

Status flow: `pending → confirmed → completed → reviewed` (+ `cancelled` by admin)

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 18, Vite, React Router, Tailwind CSS      |
| Backend  | Python Flask, SQLAlchemy, JWT, Gunicorn         |
| Database | PostgreSQL (production) · SQLite (local dev)    |

## Project structure

```
book-flow/
├── backend/          # Flask REST API
├── frontend/         # React SPA
├── docs/
│   ├── SPEC.md
│   └── DEPLOY.md     # Full deploy guide
├── render.yaml       # Render blueprint (API + PostgreSQL)
└── README.md
```

## Demo accounts

| Role  | Email            | Password  |
| ----- | ---------------- | --------- |
| Admin | `admin@demo.com` | `demo123` |
| Staff | `staff@demo.com` | `demo123` |

## Live demo

_TODO: add URLs after deploy_

<!-- Example:
- App: https://bookflow.vercel.app
- API: https://bookflow-api.onrender.com/api/health
-->

## Local setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py              # use python seed.py --reset to wipe & reseed
flask --app run run --debug
```

- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- App: `http://localhost:5173`
- Env: `VITE_API_URL=http://localhost:5000/api`

## Deploy (production)

**Recommended:** Vercel (frontend) + Render (backend + PostgreSQL)

Quick steps:

1. Push repo to GitHub
2. Render → Blueprint from `render.yaml` → set `CORS_ORIGINS` to frontend URL
3. Render Shell → `python init_production.py`
4. Vercel → import repo, root `frontend`, set `VITE_API_URL=https://YOUR-API.onrender.com/api`

Full guide: **[docs/DEPLOY.md](docs/DEPLOY.md)**

## Implementation status

- [x] Project spec + Cursor rules
- [x] Flask backend (models, API, seed data)
- [x] React frontend (public booking, admin, staff)
- [x] Email preview UI (mock)
- [ ] Deploy + live demo URL
- [ ] Screenshots + Upwork case study

## License

Portfolio / demo project.
