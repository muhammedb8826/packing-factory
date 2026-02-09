"use client";

import { JobOrdersList } from "@/components/job-orders-list";
import { useGetJobOrdersQuery } from "@/lib/apiSlice";

export function DashboardJobOrders() {
  const { data: jobOrders, isLoading, isError, error } = useGetJobOrdersQuery();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Loading job orders from API…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {(error as Error).message}. Ensure your API backend is running (see
        docs/NESTJS-INTEGRATION.md).
      </p>
    );
  }

  return <JobOrdersList initialData={jobOrders ?? []} />;
}

