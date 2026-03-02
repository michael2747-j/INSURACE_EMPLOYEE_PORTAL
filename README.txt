<div align="center">

<h1>🧾 Insurance Employee Portal</h1>

<p>
A full-stack insurance portfolio management system built with <b>FastAPI</b>, <b>PostgreSQL</b>, and a modern <b>React</b> UI (Figma-designed).
</p>

<p>
<b>Live data.</b> Real SQL relationships. Real API endpoints. Real dashboards.
</p>

<br/>

<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=0b0b0b" />
<img src="https://img.shields.io/badge/TailwindCSS-UI-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<br/><br/>

<a href="#-features">Features</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-project-structure">Project Structure</a> •
<a href="#-setup--run">Setup</a> •
<a href="#-api-overview">API</a> •
<a href="#-database">Database</a>

</div>

---

## ✨ Overview

This project is a full-stack Insurance Portfolio Management System that focuses heavily on data integrity, relational database design, and backend-driven UI.

It includes:
- A structured PostgreSQL schema (ERD-driven)
- A FastAPI backend exposing clean endpoints (with Swagger docs)
- A React + Tailwind frontend designed using Figma
- Real CRUD + filtering + detail drawers + dashboards
- Seed scripts that populate realistic insurance data (accounts, policies, coverages, claims, payments)

> Personal note: this project was built with the mindset that developers who don’t adapt to new tools get left behind — using tools like Figma seriously speeds up UI planning and execution.

---

## 🚀 Features

### ✅ Core Modules
- Dashboard
  - Portfolio summary cards
  - Live stats from the database
- Accounts
  - Search + filter
  - Live insert + refresh sanity checks
- Policies
  - Policy status & type handling
  - Detail drawer support
- Claims
  - Live claims table + detail drawer
  - Filters (status/severity), search, and live API integration
- Reports
  - Quick insights & charts (based on reporting SQL queries)

### 🔎 UX Features
- Fast global search
- Filters + sorting
- Detail drawers for deep record inspection
- Clear status badges and severity visuals

---

## 🧰 Tech Stack

Backend
- FastAPI
- Psycopg (Postgres driver)
- PostgreSQL

Frontend
- React (Vite)
- Tailwind CSS
- TypeScript

Database & Data
- ERD-driven schema
- SQL constraints + foreign keys
- Seeding scripts for realistic sample data

Design
- Figma UI planning + layout design

---

## 🗂 Project Structure

```txt
Insurance_SQL_Portfolio/
│
├── app/                    # FastAPI backend (routes, models, db)
├── Frontend/               # React frontend (Vite + Tailwind)
├── sql/
│   ├── schema.sql          # Database schema
│   └── reporting_queries.sql
├── scripts/
│   ├── seed.py
│   └── seed_bulk.py        # Bulk realistic seed generator
├── requirements.txt
