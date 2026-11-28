# Worklink

Worklink is a React + TypeScript frontend for the FastAPI backend in `..\my-app-api`. Laborers can create profiles; vendors can register, search worker profiles, and contact workers by email or phone. Login and registration return a bearer token, and TanStack Query handles API requests and cached worker searches.

## Run locally

1. Configure `D:\Python\my-app-api\.env` with `POSTGRES_PASSWORD` and a private `JWT_SECRET_KEY` (at least 32 random characters). See the backend `.env.example`.
2. Start the API and database, then apply migrations:

   ```powershell
   Set-Location D:\Python\my-app-api
   docker compose up --build -d
   docker exec myapp-api python -m alembic upgrade head
   ```

3. Start the frontend:

   ```powershell
   Set-Location D:\Python\labor-connect
   npm.cmd install
   npm.cmd run dev
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend calls `http://localhost:8000` by default. To use a different backend, create `.env.local` with `VITE_API_URL=http://localhost:8000`.

The API allows browser requests from `localhost:5173` and `127.0.0.1:5173`. Vendor-only worker directory access is enforced by the API, not just hidden in the UI.
