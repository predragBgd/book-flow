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

**Free plan nema Shell tab** — Render ga ne prikazuje na besplatnim web servisima.

### Način A — Pre-Deploy Command (preporučeno)

1. Otvori **bookflow-backend** (ne Blueprint, nego sam web servis)
2. Levo: **Settings**
3. Skroluj do **Build & Deploy**
4. **Pre-Deploy Command** → upiši:
   ```bash
   python init_production.py
   ```
5. **Save Changes**
6. Gore desno: **Manual Deploy** → **Deploy latest commit**

U logu deploy-a treba da vidiš: `Production database initialized with demo data.`

### Način B — sa svog računara (ako A ne radi)

1. **bookflow-db** → **Info** → kopiraj **External Database URL**
2. U terminalu na Mac-u:

```bash
cd ~/Sites/book-flow/backend
source venv/bin/activate
export DATABASE_URL="postgresql://..."   # paste External URL ovde
python init_production.py
```

(Treba ti aktiviran venv sa `pip install -r requirements.txt` — isto kao lokalni backend.)

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
