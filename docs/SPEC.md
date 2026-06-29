# BookFlow — Project Specification

Smart booking for service businesses. Upwork portfolio demo.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Backend | Python Flask, SQLAlchemy, Flask-JWT-Extended, Flask-CORS |
| Database | PostgreSQL (SQLite allowed for local dev) |
| Auth | JWT (admin/staff), UUID token (client, no login) |

## Workflow

```
pending → confirmed → completed → reviewed
         ↘ cancelled (admin)
```

| Step | Actor | Action |
|------|-------|--------|
| 1 | Client | Pick service + slot, enter name/email → `pending` |
| 2 | Admin | Assign staff + confirm → `confirmed` |
| 3 | Staff | Mark job done → `completed` |
| 4 | Client | Rate (1–5) + comment via `/booking/:token` → `reviewed` |

## Roles & Routes (React)

| Route | Access |
|-------|--------|
| `/` | Public booking |
| `/booking/:token` | Client status + review |
| `/admin/*` | Admin JWT |
| `/staff/*` | Staff JWT |

## Data Models

### User
- `email`, `password_hash`, `name`, `role` (`admin` | `staff`), `is_active`

### Service
- `name`, `duration_minutes`, `price` (optional), `is_active`

### BusinessHours
- `day_of_week` (0=Mon … 6=Sun), `is_open`, `open_time`, `close_time`

### BlockedDate
- `date`, `reason` (optional)

### AppSettings (singleton)
- `slot_buffer_minutes` (gap between bookings)

### Booking
- `access_token` (UUID), `client_name`, `client_email`, `client_phone`
- `service_id`, `staff_id` (nullable until confirmed)
- `scheduled_at`, `status`, `admin_notes`

### Review
- `booking_id`, `rating` (1–5), `comment`

## API Endpoints

### Public
- `GET /api/services` — active services
- `GET /api/slots?service_id=&date=` — available slots
- `POST /api/bookings` — create booking → `pending`
- `GET /api/bookings/:token` — booking details for client
- `POST /api/bookings/:token/review` — submit review → `reviewed`

### Auth
- `POST /api/auth/login` — returns JWT + role
- `GET /api/auth/me` — current user

### Admin (JWT, role=admin)
- Services CRUD: `GET|POST /api/admin/services`, `PUT|DELETE /api/admin/services/:id`
- Staff CRUD: `GET|POST /api/admin/staff`, `PUT|DELETE /api/admin/staff/:id`
- Bookings: `GET /api/admin/bookings`, `PATCH .../:id/confirm`, `PATCH .../:id/cancel`
- Clients CRM: `GET /api/admin/clients`
- Stats: `GET /api/admin/stats`
- Export: `GET /api/admin/export.csv`
- Reviews: `GET /api/admin/reviews`
- Settings: `GET|PUT /api/admin/settings/hours`, `GET|POST|DELETE /api/admin/settings/blocked-dates`, `GET|PUT /api/admin/settings/app`

### Staff (JWT, role=staff)
- `GET /api/staff/bookings` — assigned confirmed bookings
- `PATCH /api/staff/bookings/:id/complete` → `completed`

## Slot Calculation

1. Load business hours for day of week
2. Skip if day closed or date blocked
3. Generate slots from open→close using service duration + buffer
4. Remove slots overlapping existing non-cancelled bookings

## Auth Scope

**Include:** login, JWT, role checks, demo accounts  
**Exclude:** registration, password reset, OAuth, refresh tokens, 2FA

## Out of Scope (do not build)

Stripe, SMS, Google Calendar sync, multi-tenant, real email sending (preview only)

## Demo Accounts

- Admin: `admin@demo.com` / `demo123`
- Staff: `staff@demo.com` / `demo123`

## Local Dev

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- `VITE_API_URL=http://localhost:5000/api`
