Insurance Employee Portal (Full-Stack)
This is a portfolio management system built to handle real-world insurance data relationships. It uses FastAPI for the backend, Postgres for the relational data, and React/Tailwind for the frontend.

I designed the UI in Figma first to make sure the data flow actually made sense for an end-user before writing any CSS.

🛠 Tech Stack
Backend: FastAPI, Psycopg (Postgres driver)

Database: PostgreSQL (ERD-driven schema)

Frontend: React (Vite), Tailwind CSS, TypeScript

Tools: Figma, Python (for data seeding scripts)

🚀 What it does
Live Dashboard: Pulls real-time stats (policies, claims, active accounts) directly from SQL.

Relational Data: Handles complex links between Accounts -> Policies -> Coverages -> Claims.

Claims Management: Status/severity filters with detail drawers for deep record inspection.

Bulk Seeding: Includes scripts to generate thousands of realistic records so the app doesn't look empty.

Reporting: Custom SQL queries for generating portfolio insights.

🏗 Project Structure
Plaintext
Insurance_SQL_Portfolio/
├── app/                # Backend logic & API routes
├── frontend/           # React + Tailwind UI
├── sql/                # Schema & analytical queries
└── scripts/            # Python scripts for bulk data generation
⚙️ Quick Start
1. Database & Seeding
Bash
# Run the schema
psql -d insurance_db -f sql/schema.sql

# Populate with realistic data
python scripts/seed_bulk.py
2. Backend
Bash
cd app
pip install -r requirements.txt
uvicorn main:app --reload
3. Frontend
Bash
cd frontend
npm install
npm run dev
🔎 Why I built it this way
Most "portfolio" apps use JSON or simple arrays. I wanted something that felt like a real production tool.

SQL Constraints: Every table has proper foreign keys and check constraints.

Figma-to-Code: I used a professional design workflow to speed up UI execution.

FastAPI Docs: You can view all endpoints and test the API at /docs once the server is running.
