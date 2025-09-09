Deployment notes

Goal: run frontend and backend as separate Railway services.

Frontend service
- Repo path: `frontend/`
- Railway service type: Static / Node
- Add these files to the frontend service (already present): `package.json`, `vite.config.js`, `Procfile`.
- Railway env variables (Service -> Variables):
  - `VITE_API_URL` = https://<your-backend-service>.up.railway.app
- Build/start: the `Procfile` runs `npm ci`, `npm run build`, then `npm run preview -- --port $PORT`.

Backend service
- Repo path: `backend/`
- Railway service type: Python
- Use existing root `Procfile` which runs `cd backend && python -m gunicorn aieducation.wsgi:application --bind 0.0.0.0:${PORT:-8000}`
- Railway env variables (Service -> Variables):
  - `ALLOWED_HOSTS` = backend-production-c8fe.up.railway.app,frontend-production-7414.up.railway.app
  - `CSRF_TRUSTED_ORIGINS` = https://frontend-production-7414.up.railway.app
  - `CORS_ALLOWED_ORIGINS` = https://frontend-production-7414.up.railway.app
  - `CORS_ALLOW_ALL_ORIGINS` = False
  - `FRONTEND_URL` = https://frontend-production-7414.up.railway.app
  - DB / REDIS / SECRET_KEY etc.

Notes
- Make sure to create two separate Railway services (one pointing at `frontend/`, one at repo root or `backend/`).
- If you prefer a static hosting approach (upload `dist/`), you can use Railway static on the produced `dist` folder or push the build to a CDN.
- For stricter security, avoid wildcard `ALLOWED_HOSTS` and set exact hosts via Railway env variables.
