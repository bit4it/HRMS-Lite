# HRMS Lite (FastAPI + React + SQLite)

A lightweight Human Resource Management System to manage employees and track attendance.

## Project Overview
This app provides:
- Employee Management: add, list, and delete employees
- Attendance Management: mark daily attendance and view employee-wise records
- Server-side validation and meaningful error responses
- Clean UI with loading/empty/error states

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite

## Folder Structure
- `backend/` FastAPI API server
- `frontend/` React client app

## API Endpoints
- `GET /health`
- `POST /employees`
- `GET /employees`
- `DELETE /employees/{employee_id}`
- `POST /attendance`
- `GET /attendance?employee_id=<id>`

## Run Locally

### 1) Backend setup
1. Open terminal in `backend/`
2. Create virtual environment and install deps
   - `python -m venv .venv`
   - `source .venv/bin/activate`
   - `pip install -r requirements.txt`
3. Copy env file
   - `cp .env.example .env`
4. Start backend
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

Backend runs on `http://localhost:8000`.

### 2) Frontend setup
1. Open terminal in `frontend/`
2. Install deps
   - `npm install`
3. Copy env file
   - `cp .env.example .env`
4. Start frontend
   - `npm run dev`

Frontend runs on `http://localhost:5173`.

## Deployment Notes
- Deploy backend first (Render/Railway/Fly.io)
- Set backend `CORS_ORIGINS` to frontend URL
- Deploy frontend on Vercel/Netlify
- Set `VITE_API_BASE_URL` to deployed backend URL

## Assumptions / Limitations
- Single admin user (no authentication)
- Basic CRUD scope only (no payroll, leave, role management)
- Attendance is one record per employee per date
