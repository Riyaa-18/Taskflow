# ZenTask — Team Task Manager

A full-stack project & task management platform with role-based access control.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Deploy | Railway (backend + DB) + Vercel (frontend) |

## ✨ Features

- **Auth** — Signup/Login with JWT, role-based (Admin/Member)
- **Projects** — Create, update, delete projects; invite members
- **Tasks** — Create tasks, assign to members, set priority & due date
- **Status Tracking** — TODO → IN_PROGRESS → REVIEW → DONE
- **Dashboard** — Stats, overdue tasks, recent activity
- **Role-Based Access** — Admins manage projects/members; Members manage their tasks

## 🏃 Local Development

### Backend

```bash
cd backend
npm install
# Create .env (see .env.example)
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Create .env (see .env.example)
npm run dev
```

## 🚢 Deploy on Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables (see `.env.example`)
5. Deploy!

For frontend: connect Vercel to the frontend folder.

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/schema.prisma
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── hooks/
    └── package.json
```
