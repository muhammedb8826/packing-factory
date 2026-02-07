# Packaging Factory

Job order and production tracking for the packaging industry (carton, plastic, flexible, etc.). Built with Next.js and JSON Server.

## Modules (priority order)

1. **Client (MNC)** – Submit job orders, get Job ID, set user preferences (notification, dashboard view, reporting, access level).
2. **Job Order System** – Generates Job ID, records client & specs, applies preferences, notifies COE/Management.
3. **COE / Management** – Approve jobs, assign to Production & HR (UI to be extended).
4. **HR, Inventory, Production, QC, Dispatch, Financial** – Stub data in `server/db.json`; implement in later phases.
5. **Client Tracking Dashboard** – DHL-style tracking by Job ID.
6. **Reporting & Analytics** – Job-wise revenue, shift labor, inventory, financials (to be extended).

## Getting Started

**1. Start JSON Server** (API on port 3001):

```bash
npm run server
```

**2. Start the Next.js app** (in another terminal):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **New job order** to create a job and get a tracking number, **Dashboard** to see all job orders, and **Client: Preferences** to set notification/dashboard/reporting options.

Optional: set `NEXT_PUBLIC_API_URL=http://localhost:3001` if your API runs elsewhere.

**Single process (e.g. cPanel):** In production, one Node process runs both Next.js and the API. Build then start:

```bash
npm run build
npm start
```

This runs `node server.js`, which starts json-server internally and proxies `/api/*` to it. Set `PORT` (and optionally `API_PORT`) in your environment. To run only Next.js and no API in-process, use `RUN_API_IN_PROCESS=0 npm start` or `npm run start:next` (and run `npm run server` separately).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
