# Cromgen Rozgar Backend

Express + MongoDB API for the Job Portal.

## Setup

```bash
cd backend
copy .env.example .env
npm install
```

Update `.env`:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/cromgen-rozgar
JWT_SECRET=change-this-secret
CLIENT_URL=https://www.cromgenrozgar.in
```

## Run

```bash
npm run dev
```

API health:

```bash
GET http://localhost:5050/api/health
GET https://www.cromgenrozgar.in/api?path=health
```

Postman login:

```bash
POST http://localhost:5050/api/auth/login
POST https://www.cromgenrozgar.in/api?path=auth%2Flogin
```

## Seed Demo Data

Start MongoDB first, then run:

```bash
npm run seed
```

Clear demo data:

```bash
npm run seed:clear
```

Demo users:

```text
admin@cromgen.test / password123
employer@cromgen.test / password123
```

## Main API Routes

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id

GET    /api/companies
GET    /api/employers
GET    /api/candidates
GET    /api/applications
GET    /api/categories
GET    /api/locations
GET    /api/payments
GET    /api/settings

GET    /api/dashboard/employer
GET    /api/dashboard/admin
```

All list routes support:

```text
?search=react&page=1&limit=20&sort=-createdAt
```
