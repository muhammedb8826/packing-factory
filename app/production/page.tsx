import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobOrdersList } from "@/components/job-orders-list";
import { api } from "@/lib/api";

export default async function ProductionPage() {
  let jobOrders: Awaited<ReturnType<typeof api.getJobOrders>> = [];
  let error: string | null = null;
  try {
    jobOrders = await api.getJobOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load job orders";
  }

  const inProduction = jobOrders.filter((j) => j.status === "in_production");

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Production floor</h1>
          <p className="text-muted-foreground text-sm">
            Start production, log shift-wise progress, and send jobs to QC when done.
          </p>
          {inProduction.length > 0 && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
              {inProduction.length} job(s) in production.
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
      {error ? (
        <p className="text-destructive text-sm">
          {error}. Ensure JSON Server is running: <code className="rounded bg-muted px-1">npm run server</code>
        </p>
      ) : (
        <JobOrdersList initialData={jobOrders} />
      )}
    </div>
  );
}
