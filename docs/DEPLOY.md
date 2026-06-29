# BookFlow — Deploy vodič

Preporučeni stack: **Vercel** (frontend) + **Render** (backend + PostgreSQL).

## Pregled

```
Browser → Vercel (React SPA)
              ↓ HTTPS
         Render (Flask API + PostgreSQL)
```

| Servis   | Platforma | Folder     |
|----------|-----------|------------|
| Frontend | Vercel    | `frontend/` |
| Backend  | Render    | `backend/`  |
| Baza     | Render PostgreSQL | automatski |

---

## 1. GitHub repo

```bash
git init
git add .
git commit -m "BookFlow — booking demo app"
git remote add origin https://github.com/YOUR_USER/bookflow.git
git push -u origin main
```

---

## 2. Backend na Render

### Opcija A — Blueprint (brže)

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Poveži GitHub repo
3. Render učita `render.yaml` (API + PostgreSQL)
4. Posle deploy-a, u **bookflow-api** → **Environment**:
   - `CORS_ORIGINS` = URL frontenda (npr. `https://bookflow.vercel.app`)
5. **Shell** tab (ili one-off job):

```bash
python init_production.py
```

### Opcija B — Ručno

1. **New PostgreSQL** → ime `bookflow-db` → free
2. **New Web Service** → repo, **Root Directory:** `backend`
3. Podešavanja:
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 run:app`
   - **Health check path:** `/api/health`
4. Environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Internal Database URL iz PostgreSQL servisa |
| `SECRET_KEY` | random string (32+ chars) |
| `JWT_SECRET_KEY` | random string (32+ chars) |
| `CORS_ORIGINS` | frontend URL (bez `/` na kraju) |

5. Deploy → Shell → `python init_production.py`

### Provera API-ja

```
https://YOUR-API.onrender.com/api/health
→ {"status":"ok","app":"BookFlow"}
```

**Napomena:** Free tier na Renderu „spava“ posle neaktivnosti — prvi request može trajati ~30–60s.

---

## 3. Frontend na Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub repo
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite
4. **Environment Variable:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

5. Deploy

`vercel.json` već ima SPA rewrite (`/admin`, `/staff`, `/booking/:token` rade posle refresh-a).

### Alternativa: Netlify

- Root: `frontend`
- Build: `npm run build`
- Publish: `dist`
- Env: `VITE_API_URL=...`
- `netlify.toml` je već u projektu

---

## 4. Povezivanje CORS (obavezno)

Kad znaš tačan Vercel URL, vrati se na Render → **bookflow-api** → Environment:

```
CORS_ORIGINS=https://bookflow.vercel.app
```

Više domena: razdvoji zarezom, **bez razmaka**:

```
CORS_ORIGINS=https://bookflow.vercel.app,https://bookflow-git-main-user.vercel.app
```

Sačuvaj → **Manual Deploy** ili sačekaj redeploy.

---

## 5. Demo nalozi (posle init_production.py)

| Uloga | Email | Lozinka |
|-------|-------|---------|
| Admin | `admin@demo.com` | `demo123` |
| Staff | `staff@demo.com` | `demo123` |

---

## 6. README — live link

U root `README.md` zameni:

```markdown
## Live demo

https://bookflow.vercel.app
API: https://bookflow-api.onrender.com/api/health
```

---

## 7. Screenshot-i

Napravi 4–5 screenshot-a sa live URL-a i stavi u `screenshots/` — koristi u README i Upwork profilu.

---

## Troubleshooting

| Problem | Rešenje |
|---------|---------|
| CORS error u browseru | Proveri `CORS_ORIGINS` na Renderu — mora tačno da odgovara frontend origin-u |
| API 502 / timeout | Free Render se budi sporо; sačekaj i refresh |
| Login ne radi | Da li si pokrenuo `init_production.py`? |
| Prazna baza | `python init_production.py` u Render Shell |
| `postgres://` greška | Već rešeno u `config.py` (normalizacija URL-a) |
| Lokalno i dalje SQLite | OK — produkcija koristi PostgreSQL preko `DATABASE_URL` |

---

## Lokalni dev (nepromenjeno)

```bash
# Terminal 1 — backend
cd backend && source .venv/bin/activate
flask --app run run --debug

# Terminal 2 — frontend
cd frontend && npm run dev
```

Lokalno: `VITE_API_URL=http://localhost:5000/api` u `frontend/.env`
