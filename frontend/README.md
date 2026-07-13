# INSEET Frontend

React + Vite frontend for INSEET.

## API modes

Local development uses:

```env
VITE_API_URL=http://localhost:5050
```

Production build uses:

```env
VITE_API_URL=https://cromgerozgar.onrender.com
```

Run local frontend:

```bash
cd frontend
npm run dev
```

Run local backend in another terminal:

```bash
cd backend
npm run dev
```

Postman local API:

```text
POST http://localhost:5050/api/auth/login
```

Postman live API:

```text
POST https://cromgerozgar.onrender.com/api/auth/login
```
