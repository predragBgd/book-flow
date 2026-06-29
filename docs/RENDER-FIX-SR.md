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

**Free plan nema Shell ni Pre-Deploy Command** — Render to ne podržava na besplatnim servisima.

Baza se **automatski puni pri startu** servisa na Renderu (`run.py` detektuje `RENDER` env var).

Posle deploy-a proveri:
```
https://bookflow-backend-vjqb.onrender.com/api/services
```
Treba JSON sa uslugama.

### Ručno sa Mac-a (samo ako API i dalje vraća 500)

1. **bookflow-db** → **Info** → kopiraj **External Database URL**
2. U terminalu:

```bash
cd ~/Sites/book-flow/backend
source venv/bin/activate
export DATABASE_URL="postgresql://..."   # paste External URL
python init_production.py
```

## Korak 4 — provera API-ja

URL **kopiraj sa Render dashboarda** (Settings → gore desno). Render često doda sufiks, npr.:

`https://bookflow-backend-vjqb.onrender.com`

```
https://TVOJ-URL.onrender.com/api/health
```

Treba: `{"status":"ok","app":"BookFlow"}`

## Korak 5 — Vercel

**Settings** → **Environment Variables** (koristi **tvoj** Render URL + `/api`):

```
VITE_API_URL=https://bookflow-backend-vjqb.onrender.com/api
```

**Deployments** → **Redeploy** (obavezno!)

CORS je već `*` na backendu — ne moraš CORS_ORIGINS ručno (osim ako hoćeš restriktivnije).

## Demo login

- Admin: `admin@demo.com` / `demo123`
- Staff: `staff@demo.com` / `demo123`
