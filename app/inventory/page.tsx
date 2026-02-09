"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobOrdersList } from "@/components/job-orders-list";
import { useGetJobOrdersQuery } from "@/lib/apiSlice";

export default function InventoryPage() {
  const {
    data: jobOrders,
    isLoading,
    isError,
    error,
  } = useGetJobOrdersQuery();

  const list = jobOrders ?? [];
  const needsMaterials = list.filter(
    (j) => j.status === "inventory_pending" && !j.inventoryReady
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Inventory / Store
          </h1>
          <p className="text-muted-foreground text-sm">
            Check material availability, issue materials for jobs, and mark
            inventory ready so production can start.
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
      {isLoading ? (
        <p className="text-muted-foreground text-sm">
          Loading job orders from API…
        </p>
      ) : isError ? (
        <p className="text-destructive text-sm">
          {(error as Error).message}. Ensure your API backend is running (see
          docs/NESTJS-INTEGRATION.md).
        </p>
      ) : (
        <JobOrdersList initialData={list} />
      )}
    </div>
  );
}
