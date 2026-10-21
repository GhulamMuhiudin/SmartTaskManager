# 🚀 Smart Task Manager

Full-stack task management application built with **React**, **Express.js**, and **PostgreSQL**.

## Features

- **User Authentication** — Sign up, login, JWT-based sessions
- **Task Management** — CRUD operations with status, priority, due dates
- **Project Organization** — Group tasks into projects
- **Smart Dashboard** — Stats, charts, deadlines, recent activity
- **Kanban Board** — Drag-and-drop task management
- **Search & Filters** — Find tasks by status, priority, project

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | React 18 + Vite          |
| Styling    | Tailwind CSS             |
| Backend    | Node.js + Express.js     |
| Database   | PostgreSQL               |
| Auth       | JWT + bcryptjs           |
| Deployment | AWS EC2 + Nginx + PM2    |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE smart_task_manager;"

# Run schema
psql -U postgres -d smart_task_manager -f database/schema.sql

# (Optional) Load sample data
psql -U postgres -d smart_task_manager -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env     # Edit with your DB credentials
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
smart-task-manager/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── api.js
├── backend/           # Express.js API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── database/          # SQL schema & seeds
└── README.md
```

## API Endpoints

| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | /api/auth/register     | Register new user    |
| POST   | /api/auth/login        | Login user           |
| GET    | /api/auth/profile      | Get current user     |
| PUT    | /api/auth/profile      | Update profile       |
| GET    | /api/tasks             | Get all tasks        |
| POST   | /api/tasks             | Create task          |
| PUT    | /api/tasks/:id         | Update task          |
| DELETE | /api/tasks/:id         | Delete task          |
| GET    | /api/projects          | Get all projects     |
| POST   | /api/projects          | Create project       |
| PUT    | /api/projects/:id      | Update project       |
| DELETE | /api/projects/:id      | Delete project       |
| GET    | /api/dashboard/stats   | Dashboard statistics |

## License

MIT
