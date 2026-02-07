# Packaging Factory

Job order and production tracking for the packaging industry (carton, plastic, flexible, etc.). **Next.js frontend** ready to integrate with your API backend (e.g. NestJS).

## Modules (priority order)

1. **Client (MNC)** – Submit job orders, get Job ID, set user preferences (notification, dashboard view, reporting, access level).
2. **Job Order System** – Generates Job ID, records client & specs, applies preferences, notifies COE/Management.
3. **COE / Management** – Approve jobs, assign to Production & HR (UI to be extended).
4. **HR, Inventory, Production, QC, Dispatch, Financial** – Labor, materials, production logs, QC, dispatch, invoices.
5. **Client Tracking Dashboard** – DHL-style tracking by Job ID.
6. **Reporting & Analytics** – Job-wise revenue, shift labor, inventory, financials (to be extended).

## Getting Started

The frontend expects a REST API. Use your own backend (e.g. **NestJS**). Full API contract and integration steps: **[docs/NESTJS-INTEGRATION.md](docs/NESTJS-INTEGRATION.md)**.

**1. Start your API backend** (e.g. NestJS on port 3001):

```bash
# In your NestJS project (or other backend)
npm run start:dev
```

**2. Start the Next.js app:**

```bash
# Option A: Next.js only (set API URL to your backend)
echo NEXT_PUBLIC_API_URL=http://localhost:3001 >> .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Option B: Custom server (proxy /api to backend)**  
Useful when you want same-origin `/api` and the Node server to proxy to your backend:

```bash
# Backend must be running (e.g. NestJS on 3001)
export API_BACKEND_URL=http://127.0.0.1:3001   # optional; default is this
npm run build
npm start
```

This runs `node server.js`: it **proxies `/api/*` to `API_BACKEND_URL`** (default `http://127.0.0.1:3001`). Set `PORT` (default 4000) and `API_BACKEND_URL` if your backend is elsewhere.

**If you see API 404 or "API backend unavailable":** (1) Start your backend first. (2) With custom server, set `API_BACKEND_URL` if the backend is not at `http://127.0.0.1:3001`. (3) Do not set `NEXT_PUBLIC_API_URL` to an empty string; use `"/api"` or your backend URL.

## Reference

- **API contract and types:** [docs/NESTJS-INTEGRATION.md](docs/NESTJS-INTEGRATION.md)
- **Frontend API client:** `lib/api.ts`
- **Shared types:** `lib/types.ts`
- **Sample data shape (for seeding backend):** `server/db.json`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

## Deploy on Vercel

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying). For a self-hosted or cPanel setup, run `npm run build && npm start` and ensure your API backend is deployed and `API_BACKEND_URL` (or `NEXT_PUBLIC_API_URL`) is set correctly.
