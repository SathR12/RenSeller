# RenSeller
A web application that lets RPI students sell and buy anything.

## Run the Website

The frontend and backend run as separate local servers. Open two PowerShell terminals.

### 1. Start the frontend

From the repository root:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173/
```

You can also start it by changing into the frontend folder first:

```powershell
cd frontend
npm install
npm run dev
```

Keep this terminal running while you work. Vite automatically updates the browser when frontend files change.

### 2. Start the backend

In a second PowerShell terminal, from the repository root:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000/
```

Check that it is healthy by opening:

```text
http://127.0.0.1:8000/health
```

The expected response is:

```json
{"status":"healthy"}
```

### Create an .env file for the database

Create a .env.local file that contains the contents in .env.example
and replace with proper url and key.

For authentication, enable Email authentication in Supabase. Supabase will send a verification email after sign-up; set the local redirect URL to `http://localhost:5173/` under Authentication settings. Sign-up accepts only `@rpi.edu` addresses and automatically derives the username from the email prefix.


### Useful frontend commands

Run these from `frontend`, or use the `npm --prefix frontend` form from the repository root:

```powershell
npm run build
npm run lint
```

`npm run build` checks TypeScript and creates the production files in `frontend/dist`. `npm run lint` checks the source code for common problems.

### Common mistake

This will fail from the repository root because the root does not have a `package.json`:

```powershell
npm run dev
```

Use this instead:

```powershell
npm --prefix frontend run dev
```
