# EduERP — School Enterprise Resource Planning System

A comprehensive, production-grade School ERP built as a full-stack TypeScript monorepo with strict three-tier Role-Based Access Control (RBAC).

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router) + TailwindCSS + Zustand
- **Backend**: NestJS + Drizzle ORM + PostgreSQL
- **Auth**: JWT + Refresh Token Rotation
- **Monorepo**: pnpm + Turborepo

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### 1. Clone & Install

```bash
git clone <repo-url> EduERP
cd EduERP
pnpm install
```

### 2. Start Database

```bash
docker compose up -d
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 4. Run Database Seed

```bash
cd apps/api && pnpm db:seed
```

### 5. Start Development Servers

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/api/v1/docs

## 🔐 Default Login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@eduerp.com` | `Admin@123456` |

## 📂 Project Structure

```
EduERP/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared types, enums, validators
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## 🎭 Roles

- **Super Admin**: Full system access — users, finance, reports, settings
- **Teacher**: Classroom management — attendance, assignments, grading
- **Student**: Personal portal — results, timetable, submissions

## 📄 License

Private — All rights reserved.
