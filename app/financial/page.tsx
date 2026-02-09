"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobOrdersList } from "@/components/job-orders-list";
import { useGetJobOrdersQuery } from "@/lib/apiSlice";

export default function FinancialPage() {
  const {
    data: jobOrders,
    isLoading,
    isError,
    error,
  } = useGetJobOrdersQuery();

  const list = jobOrders ?? [];
  const needsBilling = list.filter(
    (j) =>
      j.status === "qc_done" ||
      j.status === "ready_dispatch" ||
      j.status === "dispatched"
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial</h1>
          <p className="text-muted-foreground text-sm">
            Job billing and invoicing (advance / full). Mark invoices paid and
            mark job financial completed.
          </p>
          {needsBilling.length > 0 && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
              {needsBilling.length} job(s) eligible for billing.
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
