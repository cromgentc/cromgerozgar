# INSEET Backend

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
MONGO_URI=mongodb://127.0.0.1:27017/inseet
JWT_SECRET=change-this-secret
CLIENT_URL=https://www.inseet.in
```

Resume uploads are stored in Cloudflare R2. Create an R2 API token with object read/write access for the `inseet-resumes` bucket, then add:

```env
CLOUDFLARE_R2_ACCOUNT_ID=69d4cb35ab86c2664455ce656338ea7a
CLOUDFLARE_R2_BUCKET=inseet-resumes
CLOUDFLARE_R2_RESUME_FOLDER=
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_PUBLIC_URL=
```

`CLOUDFLARE_R2_PUBLIC_URL` is optional. Leave it blank for private storage; resumes will still open through the protected API viewer.

## Run

```bash
npm run dev
```

API health:

```bash
GET http://localhost:5050/api/health
GET https://www.inseet.in/api?path=health
```

Postman login:

```bash
POST http://localhost:5050/api/auth/login
POST https://www.inseet.in/api?path=auth%2Flogin
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
admin@inseet.test / password123
employer@inseet.test / password123
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
