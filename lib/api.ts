const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getClients: () => fetchApi<Array<import("@/lib/types").Client>>("/clients"),
  getClient: (id: number) =>
    fetchApi<import("@/lib/types").Client>(`/clients/${id}`),

  getUserPreferences: (clientId: number) =>
    fetchApi<Array<import("@/lib/types").UserPreferences>>(
      `/userPreferences?clientId=${clientId}`
    ),
  updateUserPreferences: (
    id: number,
    data: Partial<import("@/lib/types").UserPreferences>
  ) =>
    fetchApi<import("@/lib/types").UserPreferences>(`/userPreferences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  createUserPreferences: (data: Omit<import("@/lib/types").UserPreferences, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<import("@/lib/types").UserPreferences>("/userPreferences", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),

  getJobOrders: () =>
    fetchApi<Array<import("@/lib/types").JobOrder>>("/jobOrders"),
  getJobOrder: (id: number) =>
    fetchApi<import("@/lib/types").JobOrder>(`/jobOrders/${id}`),
  getJobOrderByJobId: (jobId: string) =>
    fetchApi<Array<import("@/lib/types").JobOrder>>(
      `/jobOrders?jobId=${encodeURIComponent(jobId)}`
    ),
  createJobOrder: (body: Omit<import("@/lib/types").JobOrder, "id">) =>
    fetchApi<import("@/lib/types").JobOrder>("/jobOrders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateJobOrder: (
    id: number | string,
    data: Partial<import("@/lib/types").JobOrder>
  ) =>
    fetchApi<import("@/lib/types").JobOrder>(`/jobOrders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // HR
  getEmployees: () =>
    fetchApi<Array<import("@/lib/types").Employee>>("/employees"),
  getShifts: () =>
    fetchApi<Array<import("@/lib/types").Shift>>("/shifts"),
  getLaborAssignments: (jobOrderId: number | string) =>
    fetchApi<Array<import("@/lib/types").LaborAssignment>>(
      `/laborAssignments?jobOrderId=${encodeURIComponent(String(jobOrderId))}`
    ),
  createLaborAssignment: (
    body: Omit<import("@/lib/types").LaborAssignment, "id">
  ) =>
    fetchApi<import("@/lib/types").LaborAssignment>("/laborAssignments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteLaborAssignment: (id: number | string) =>
    fetchApi<unknown>(`/laborAssignments/${id}`, { method: "DELETE" }),
};

/** Generate next Job ID (e.g. JO-2025-00001) from existing job orders */
export function generateNextJobId(orders: { jobId: string }[]): string {
  const year = new Date().getFullYear();
  const prefix = `JO-${year}-`;
  const sameYear = orders.filter((o) => o.jobId.startsWith(prefix));
  const maxNum = sameYear.reduce((max, o) => {
    const num = parseInt(o.jobId.slice(prefix.length), 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const next = maxNum + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
