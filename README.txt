# Insurance Portfolio Management System

A full-stack insurance management platform built for learning, portfolio development, and backend-focused system design.

This project demonstrates relational database modeling, API development with FastAPI, client–server communication, and real-time frontend integration using a clean and structured architecture.

---

## Overview

The Insurance Portfolio Management System simulates an internal employee portal used to manage insurance accounts, policies, and claims.

Users can:

- View live portfolio statistics
- Search and filter insurance accounts
- Track policies and their statuses
- Monitor claims with severity classification
- Generate structured reports based on SQL queries

The frontend runs in the browser and communicates with a FastAPI backend, which connects directly to a PostgreSQL database. All displayed data is fetched live from the database — no mock data is used in the final system.

This repository is designed to be both:
- a portfolio-ready full-stack project
- a structured demonstration of database-driven system design

---

## Project Goals

- Demonstrate strong relational database modeling (ERD-driven)
- Show clean backend architecture using FastAPI
- Provide structured API endpoints with Swagger documentation
- Implement real-time CRUD operations
- Maintain relational integrity through foreign keys and constraints

This is not a production insurance platform. The focus is clarity, structure, and database-centered system design.

---

## Architecture

- Frontend: React (Vite), TypeScript, Tailwind CSS
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Design: Figma (UI planning and layout)

---

## Features

- Account management with search and filtering
- Policy tracking with status categorization
- Claim monitoring with severity classification
- Drawer-based detailed record views
- Live API integration (no mock data)
- Swagger UI for backend endpoint testing
- Bulk data seeding for realistic sample data

---

## Project Structure

```text
├── app/                     # FastAPI backend (routes, models, db logic)
├── Frontend/                # React frontend
├── sql/
│   ├── schema.sql           # Database schema definition
│   └── reporting_queries.sql
├── scripts/
│   ├── seed.py              # Sample data seeding
│   └── seed_bulk.py         # Bulk realistic data generator
├── requirements.txt
└── README.md


