TEAM TASK MANAGER
=================

A simple full-stack task manager with role-based access (Admin/Member).

FEATURES
--------
- JWT authentication
- Role-based permissions
- Project and task management
- React + Vite frontend
- Node.js + Express + MongoDB backend

TECH STACK
----------
- Frontend: React, Vite, Axios
- Backend: Node.js, Express, Mongoose, JWT
- Database: MongoDB

PROJECT STRUCTURE
-----------------
backend/
  models/
  routes/
  middleware/
  server.js
frontend/
  src/
  index.html
  vite.config.js

LOCAL SETUP
-----------
Prerequisites:
- Node.js and npm
- MongoDB running locally

Backend:
1. cd backend
2. npm install
3. Create .env (see ENVIRONMENT below)
4. npm run dev
   - Runs on http://localhost:5000

Frontend:
1. cd frontend
2. npm install
3. Create .env (see ENVIRONMENT below)
4. npm run dev
   - Runs on http://localhost:3000

ENVIRONMENT
-----------
Backend .env example:
- PORT=5000
- MONGO_URI=mongodb://localhost:27017/taskmanager
- JWT_SECRET=your_secret

Frontend .env example:
- VITE_API_URL=http://localhost:5000/api

API ENDPOINTS
-------------
Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me

Projects:
- GET    /api/projects
- POST   /api/projects            (Admin only)
- GET    /api/projects/:id
- POST   /api/projects/:id/members (Admin only)
- PUT    /api/projects/:id         (Admin only)
- DELETE /api/projects/:id         (Admin only)

Tasks:
- GET    /api/tasks/my
- GET    /api/tasks/project/:projectId
- POST   /api/tasks                (Admin only)
- PUT    /api/tasks/:id
- DELETE /api/tasks/:id             (Admin only)

ROLES
-----
- Admin: Create/delete projects & tasks, add members, assign tasks
- Member: View projects/tasks, update task status only

DEPLOYMENT
----------
Frontend (Vercel):
- Build Command: npm run build
- Output Directory: dist
- Run/Preview (local): npm run preview

Backend (Render):
Option A (Root Directory = backend):
- Build Command: npm install
- Start Command: npm start

Option B (Root Directory = repo root):
- Build Command: npm install --prefix backend
- Start Command: npm start --prefix backend

GITIGNORE (RECOMMENDED)
----------------------
- node_modules/
- .env
- dist/
- build/
- .vercel/
- .DS_Store
