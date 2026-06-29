# Vercel — brzi fix

## Podešavanja projekta

| Polje | Vrednost |
|-------|----------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build | `npm run build` |
| Output | `dist` |

## Environment Variable (obavezno)

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://bookflow-backend-vjqb.onrender.com/api` |

Kopiraj tačan URL sa Render dashboarda (može imati sufiks poput `-vjqb`) + `/api`.

## Posle promene env var

**Deployments** → **⋯** → **Redeploy**

Bez redeploy-a frontend i dalje koristi stari build bez API URL-a.

## Provera

Otvori sajt → F12 → Network → refresh.

Request ide ka `bookflow-backend.onrender.com/api/services` — ne localhost.
