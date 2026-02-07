import Link from "next/link";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobOrder, Invoice } from "@/lib/types";

function byStatus(orders: JobOrder[]) {
  const map: Record<string, number> = {};
  for (const j of orders) {
    map[j.status] = (map[j.status] ?? 0) + 1;
  }
  return map;
}

function invoicedByJob(invoices: Invoice[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const inv of invoices) {
    const key = String(inv.jobOrderId);
    map[key] = (map[key] ?? 0) + inv.amount;
  }
  return map;
}

export default async function ReportingPage() {
  let jobOrders: JobOrder[] = [];
  let invoices: Invoice[] = [];
  let error: string | null = null;
  try {
    [jobOrders, invoices] = await Promise.all([
      api.getJobOrders(),
      api.getInvoices(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  const statusCounts = byStatus(jobOrders);
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const invoicedPerJob = invoicedByJob(invoices);
  const completedCount = statusCounts["financial_completed"] ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reporting & analytics</h1>
        <p className="text-muted-foreground text-sm">
          Job-wise summary, revenue, and status. Respects user preferences for report visibility.
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm">
          {error}. Ensure JSON Server is running:{" "}
          <code className="rounded bg-muted px-1">npm run server</code>
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{jobOrders.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {jobOrders.length - completedCount}
                </span>
                <p className="text-muted-foreground text-xs">
                  submitted → dispatched
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total invoiced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {totalInvoiced.toLocaleString()}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Financial completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{completedCount}</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Jobs by status</CardTitle>
              <CardDescription>Count per status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 text-sm">
                {Object.entries(statusCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([status, count]) => (
                    <span
                      key={status}
                      className="rounded-md bg-muted px-2 py-1 font-medium"
                    >
                      {status}: {count}
                    </span>
                  ))}
                {Object.keys(statusCounts).length === 0 && (
                  <span className="text-muted-foreground">No jobs</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job-wise summary</CardTitle>
              <CardDescription>Revenue and financial status per job</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoiced</TableHead>
                    <TableHead>Financial completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground text-center">
                        No job orders
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobOrders.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono font-medium">
                          <Link
                            href={`/client/track/${encodeURIComponent(job.jobId)}`}
                            className="text-primary hover:underline"
                          >
                            {job.jobId}
                          </Link>
                        </TableCell>
                        <TableCell>{job.clientId}</TableCell>
                        <TableCell>{job.specifications.productType}</TableCell>
                        <TableCell>{job.status}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {(invoicedPerJob[String(job.id)] ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {job.financialCompleted
                            ? new Date(job.financialCompleted).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
