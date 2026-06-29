# Render — brzi fix (5 minuta)

Problem: `Cannot GET /api/health` + `x-powered-by: Express` = **pogrešan Node servis**, ne Flask.

## Korak 1 — obriši pogrešne servise

Render Dashboard → za **svaki Web Service**:

- Ako je **Language: Node** → **Settings** → **Delete Web Service**
- Obriši i stari **`bookflow-api`** ako je Node/Express

**Postgres `bookflow-db` NE briši** (ili kreiraj novi posle).

## Korak 2 — Blueprint (preporučeno)

1. **New** → **Blueprint**
2. Repo: `predragBgd/book-flow`
3. **Apply** (učita novi `render.yaml`)
4. Kreira se:
   - **`bookflow-backend`** (Python Flask) ← pravi API
   - **`bookflow-db`** (Postgres)

Sačekaj status **Live** (5–10 min).

## Korak 3 — seed baze

**bookflow-backend** → **Shell**:

```bash
python init_production.py
```

## Korak 4 — provera API-ja

URL je **`https://bookflow-backend.onrender.com`** (ne stari bookflow-api!)

```
https://bookflow-backend.onrender.com/api/health
```

Treba: `{"status":"ok","app":"BookFlow"}`

## Korak 5 — Vercel

**Settings** → **Environment Variables**:

```
VITE_API_URL=https://bookflow-backend.onrender.com/api
```

**Deployments** → **Redeploy** (obavezno!)

CORS je već `*` na backendu — ne moraš CORS_ORIGINS ručno (osim ako hoćeš restriktivnije).

## Demo login

- Admin: `admin@demo.com` / `demo123`
- Staff: `staff@demo.com` / `demo123`
