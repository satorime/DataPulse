# DataPulse

A personal health tracking and analytics portal built with **.NET 8**, **Django**, and **React**. Track daily health metrics and get ML-powered predictions and anomaly alerts.

## Architecture

```
React (Vite)  →  /api/dotnet/*  →  .NET 8 API   (auth, CRUD)
              →  /api/django/*  →  Django API    (ML, analytics)
                                        ↕
                                   PostgreSQL
```

- **.NET API** — user auth (JWT), health record CRUD, schema ownership
- **Django API** — weight predictions (linear regression), 30-day summaries, anomaly detection
- **React** — dashboard with Plotly charts, Tailwind UI
- **PostgreSQL** — single shared database; .NET creates and owns the schema

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### Run

```bash
git clone <your-repo-url>
cd DataPulse
docker compose up --build
```

| Service | URL |
|---|---|
| React frontend | http://localhost:3000 |
| .NET API | http://localhost:5000 |
| Django API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

The database schema is created automatically on first run by the .NET API (`EnsureCreated`).

## Project Structure

```
DataPulse/
├── docker-compose.yml
├── dotnet-api/                        # ASP.NET Core Web API
│   ├── Dockerfile
│   └── DataPulse.API/
│       ├── Controllers/
│       │   ├── AuthController.cs      # POST /api/auth/register, /login
│       │   └── HealthRecordsController.cs  # CRUD /api/healthrecords
│       ├── Data/AppDbContext.cs
│       ├── DTOs/
│       ├── Models/
│       │   ├── User.cs
│       │   └── HealthRecord.cs
│       └── Services/AuthService.cs
├── django-api/                        # Django REST Framework + ML
│   ├── analytics/
│   │   ├── authentication.py          # Validates .NET-issued JWTs
│   │   ├── models.py                  # Read-only mirror of .NET's table
│   │   └── views.py                   # predict_weight, health_summary, detect_anomalies
│   └── config/
└── frontend/                          # React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── HealthForm.jsx
            ├── WeightChart.jsx        # Plotly chart with forecast overlay
            └── StatsCard.jsx
```

## API Reference

### .NET API (`localhost:5000`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/healthrecords` | Yes | List all records for current user |
| POST | `/api/healthrecords` | Yes | Create a new health record |
| PUT | `/api/healthrecords/{id}` | Yes | Update a record |
| DELETE | `/api/healthrecords/{id}` | Yes | Delete a record |

**Health record fields** (all optional except date):

```json
{
  "weight": 72.5,
  "systolicBp": 120,
  "diastolicBp": 80,
  "steps": 8500,
  "sleepHours": 7.5,
  "heartRate": 68,
  "notes": "Felt great today",
  "date": "2026-03-19T00:00:00Z"
}
```

### Django API (`localhost:8000`)

All endpoints require the same JWT issued by the .NET API.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/predict/weight/` | 7-day weight forecast (linear regression) |
| GET | `/api/analytics/summary/` | 30-day averages for all metrics |
| GET | `/api/analytics/anomalies/` | Detected anomalies (BP, HR, sleep) |

## Configuration

### Changing the JWT secret

The JWT secret must match in both services. Update it in one place — `docker-compose.yml`:

```yaml
# Under both dotnet-api and django-api environment:
- Jwt__Key=your-new-secret-here          # .NET
- JWT_SECRET=your-new-secret-here        # Django
```

### Connecting to an external database (e.g. Supabase)

Update the connection strings in `docker-compose.yml`:

```yaml
# .NET
- ConnectionStrings__DefaultConnection=Host=<host>;Database=<db>;Username=<user>;Password=<pass>

# Django
- DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>
```

## Deployment (Free Tier)

| Service | Hosts | Free tier |
|---|---|---|
| [Render](https://render.com) | .NET API + Django API | Yes (spins down after inactivity) |
| [Vercel](https://vercel.com) | React frontend | Yes (always on) |
| [Supabase](https://supabase.com) | PostgreSQL | Yes (500 MB) |

For production builds, replace the frontend `Dockerfile` with a multi-stage Nginx build and set the two API base URLs as Vite env vars (`VITE_DOTNET_API_URL`, `VITE_DJANGO_API_URL`).

## Local Development (without Docker)

**PostgreSQL** — run via Docker only:
```bash
docker compose up postgres
```

**.NET API:**
```bash
cd dotnet-api/DataPulse.API
dotnet run
```

**Django API:**
```bash
cd django-api
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

**React frontend:**
```bash
cd frontend
npm install
npm run dev
```

> Update `vite.config.js` proxy targets to `http://localhost:5000` and `http://localhost:8000` when running outside Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Plotly.js |
| Core API | ASP.NET Core 8, Entity Framework Core, Npgsql |
| Analytics API | Django 5, Django REST Framework, scikit-learn, pandas |
| Database | PostgreSQL 16 |
| Auth | JWT (issued by .NET, validated by both APIs) |
| Containers | Docker, Docker Compose |
