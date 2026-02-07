# NestJS Integration Guide

This guide explains how to connect the **Packaging Factory** Next.js frontend to your **NestJS** backend.

## Overview

- **Frontend:** Next.js app in this repo; it talks to the API via `lib/api.ts`.
- **API base URL:** Controlled by `NEXT_PUBLIC_API_URL`. In the browser it defaults to `/api` (proxied by the Node server); for a separate NestJS app you point it to the NestJS URL.
- **Contract:** REST-style endpoints returning JSON. All request/response shapes are defined in `lib/types.ts`.

## 1. Point the frontend to NestJS

Set the API base URL to your NestJS server (e.g. port 3001):

```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- **Browser:** Requests go to `http://localhost:3001/...` (must allow CORS from the Next.js origin).
- **SSR:** `lib/api.ts` uses the same URL on the server, so ensure NestJS is reachable from the machine running Next.js (e.g. `http://127.0.0.1:3001` or your Nest host).

If NestJS is served under a path (e.g. `http://localhost:3001/api`), set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Then the frontend will call `http://localhost:3001/api/jobOrders`, etc.

## 2. CORS (NestJS)

Allow the Next.js origin so browser requests succeed:

```ts
// main.ts (or app.module.ts)
app.enableCors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

## 3. API contract (endpoints and types)

The frontend expects the following. All IDs can be number or string; dates are ISO strings. Types below match `lib/types.ts`.

### Clients

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients` | List all clients. Response: `Client[]` |
| GET | `/clients/:id` | One client. Response: `Client` |

**Client:** `{ id, code, name, contact, email, phone, address, createdAt }`

---

### User preferences

| Method | Path | Description |
|--------|------|-------------|
| GET | `/userPreferences?clientId=:clientId` | List by client. Response: `UserPreferences[]` |
| PATCH | `/userPreferences/:id` | Partial update. Body: `Partial<UserPreferences>` |
| POST | `/userPreferences` | Create. Body: `Omit<UserPreferences, "id" \| "createdAt" \| "updatedAt">`; server may set timestamps. Response: `UserPreferences` |

**UserPreferences:** `{ id, clientId, notificationType, dashboardView, reportingFrequency, accessLevel, createdAt, updatedAt }`  
Enums: `notificationType` (email \| sms \| push), `dashboardView` (simple \| progress \| financial), `reportingFrequency` (daily \| weekly \| monthly), `accessLevel` (viewer \| member \| full).

---

### Job orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobOrders` | List all. Response: `JobOrder[]` |
| GET | `/jobOrders?jobId=:jobId` | Filter by jobId (e.g. JO-2025-00001). Response: `JobOrder[]` |
| GET | `/jobOrders/:id` | One by numeric/id. Response: `JobOrder` |
| POST | `/jobOrders` | Create. Body: `Omit<JobOrder, "id">`. Response: `JobOrder` |
| PATCH | `/jobOrders/:id` | Partial update. Body: `Partial<JobOrder>`. Response: `JobOrder` |

**JobOrder:** `{ id, jobId, clientId, status, specifications, createdAt, approvedAt, assignedToProduction, assignedToHR, hrReady, inventoryReady, productionStarted, qcStatus, dispatchReady, dispatchedAt, financialCompleted }`  
**JobOrderStatus:** `submitted | approved | hr_pending | inventory_pending | in_production | qc_pending | qc_done | ready_dispatch | dispatched | financial_completed`  
**JobSpecifications:** `{ productType, quantity, dimensions?, material?, finish?, notes? }`; `productType`: carton \| plastic \| flexible \| other.

---

### HR

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employees` | List. Response: `Employee[]` |
| GET | `/shifts` | List. Response: `Shift[]` |
| GET | `/laborAssignments?jobOrderId=:jobOrderId` | By job. Response: `LaborAssignment[]` |
| POST | `/laborAssignments` | Create. Body: `Omit<LaborAssignment, "id">`. Response: `LaborAssignment` |
| DELETE | `/laborAssignments/:id` | Delete. Response: any |

**Employee:** `{ id, code, name, skills[], available, createdAt }`  
**Shift:** `{ id, name, startTime, endTime, createdAt }`  
**LaborAssignment:** `{ id, jobOrderId, employeeId, shiftId, assignedAt }`

---

### Inventory / materials

| Method | Path | Description |
|--------|------|-------------|
| GET | `/materials` | List. Response: `Material[]` |
| GET | `/materials/:id` | One. Response: `Material` |
| PATCH | `/materials/:id` | Partial update. Body: `Partial<Material>`. Response: `Material` |
| GET | `/materialIssues?jobOrderId=:jobOrderId` | By job. Response: `MaterialIssue[]` |
| POST | `/materialIssues` | Create. Body: `Omit<MaterialIssue, "id">`. Response: `MaterialIssue` |

**Material:** `{ id, code, name, unit, quantityInStock, minThreshold?, createdAt }`  
**MaterialIssue:** `{ id, jobOrderId, materialId, quantity, issuedAt }`

---

### Production

| Method | Path | Description |
|--------|------|-------------|
| GET | `/productionLogs?jobOrderId=:jobOrderId` | By job. Response: `ProductionLog[]` |
| POST | `/productionLogs` | Create. Body: `Omit<ProductionLog, "id">`. Response: `ProductionLog` |

**ProductionLog:** `{ id, jobOrderId, shiftId, quantityProduced, notes?, loggedAt }`

---

### Quality control

| Method | Path | Description |
|--------|------|-------------|
| GET | `/qcRecords?jobOrderId=:jobOrderId` | By job. Response: `QcRecord[]` |
| POST | `/qcRecords` | Create. Body: `Omit<QcRecord, "id">`. Response: `QcRecord` |

**QcRecord:** `{ id, jobOrderId, result, notes?, checkedAt }`; `result`: `pass` \| `rework`.

---

### Financial (invoices)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/invoices` | List all. Response: `Invoice[]` |
| GET | `/invoices?jobOrderId=:jobOrderId` | By job. Response: `Invoice[]` |
| POST | `/invoices` | Create. Body: `Invoice` fields (id/createdAt/paidAt can be omitted; frontend may send status, createdAt). Response: `Invoice` |
| PATCH | `/invoices/:id` | Partial update. Body: `Partial<Invoice>`. Response: `Invoice` |

**Invoice:** `{ id, jobOrderId, clientId, amount, type, status, paidAt, createdAt }`; `type`: advance \| full; `status`: pending \| paid.

---

## 4. Running both apps

**Option A – Two processes (recommended for dev):**

```bash
# Terminal 1: NestJS (e.g. port 3001)
cd your-nestjs-project && npm run start:dev

# Terminal 2: Next.js
cd packing-factory
echo NEXT_PUBLIC_API_URL=http://localhost:3001 >> .env.local
npm run dev
```

**Option B – Next.js proxy to NestJS (same-origin `/api`):**

Keep the frontend using `/api` and proxy in the Node custom server:

1. In `server.js`, `/api/*` is proxied to `API_BACKEND_URL` (default `http://127.0.0.1:3001`). Run your NestJS app on that port (or set `API_BACKEND_URL`).
2. Do not set `NEXT_PUBLIC_API_URL` (or set to `/api`) so the client calls `/api/jobOrders`, etc.
3. Ensure NestJS is running (e.g. `npm run start:dev` in the Nest project) before starting the Next app.

## 5. NestJS project structure suggestion

- **Modules:** `ClientsModule`, `UserPreferencesModule`, `JobOrdersModule`, `EmployeesModule`, `ShiftsModule`, `LaborAssignmentsModule`, `MaterialsModule`, `MaterialIssuesModule`, `ProductionLogsModule`, `QcRecordsModule`, `InvoicesModule`.
- **DTOs:** Copy or mirror the TypeScript interfaces from `lib/types.ts` into your Nest project (e.g. `dto/create-job-order.dto.ts`, `entities/job-order.entity.ts`) and use them in controllers and services.
- **Global prefix (optional):** If you use `app.setGlobalPrefix('api')`, set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` so paths match.

## 6. Reference files in this repo

| File | Purpose |
|------|--------|
| `lib/api.ts` | All client-side API calls (paths and methods). |
| `lib/types.ts` | Shared TypeScript types for request/response bodies. |
| `server/db.json` | Sample data shape for seeding or reference. |

Implementing the endpoints above in NestJS with matching paths and JSON shapes will make the Packaging Factory frontend work with your NestJS backend without frontend code changes (other than `NEXT_PUBLIC_API_URL`).
