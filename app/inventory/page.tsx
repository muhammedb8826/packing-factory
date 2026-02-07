import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobOrdersList } from "@/components/job-orders-list";
import { api } from "@/lib/api";

export default async function InventoryPage() {
  let jobOrders: Awaited<ReturnType<typeof api.getJobOrders>> = [];
  let error: string | null = null;
  try {
    jobOrders = await api.getJobOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load job orders";
  }

  const needsMaterials = jobOrders.filter(
    (j) => j.status === "inventory_pending" && !j.inventoryReady
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory / Store</h1>
          <p className="text-muted-foreground text-sm">
            Check material availability, issue materials for jobs, and mark inventory ready so production can start.
          </p>
          {needsMaterials.length > 0 && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
              {needsMaterials.length} job(s) need materials issued.
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
      {error ? (
        <p className="text-destructive text-sm">
          {error}. Ensure your API backend is running (see docs/NESTJS-INTEGRATION.md).
        </p>
      ) : (
        <JobOrdersList initialData={jobOrders} />
      )}
    </div>
  );
}
