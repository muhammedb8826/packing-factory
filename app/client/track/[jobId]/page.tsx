import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  approved: "Approved",
  hr_pending: "HR assigning labor",
  inventory_pending: "Checking inventory",
  in_production: "In production",
  qc_pending: "Quality check",
  qc_done: "QC passed",
  ready_dispatch: "Ready for dispatch",
  dispatched: "Dispatched",
  financial_completed: "Completed",
};

export default async function ClientTrackPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const decoded = decodeURIComponent(jobId);
  let orders: Awaited<ReturnType<typeof api.getJobOrderByJobId>>;
  try {
    orders = await api.getJobOrderByJobId(decoded);
  } catch {
    notFound();
  }
  const job = orders[0];
  if (!job) notFound();

  const statusLabel = STATUS_LABELS[job.status] ?? job.status;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Track job</h1>
          <p className="font-mono text-muted-foreground">{job.jobId}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-sm">
              {statusLabel}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Specifications</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <ul className="list-inside list-disc space-y-1">
              <li>Type: {job.specifications.productType}</li>
              <li>Quantity: {job.specifications.quantity.toLocaleString()}</li>
              {job.specifications.dimensions && (
                <li>Dimensions: {job.specifications.dimensions}</li>
              )}
              {job.specifications.material && (
                <li>Material: {job.specifications.material}</li>
              )}
              {job.specifications.finish && (
                <li>Finish: {job.specifications.finish}</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
          <p className="text-muted-foreground text-sm">
            Order created {new Date(job.createdAt).toLocaleString()}. Further steps (COE approval, HR, inventory, production, QC, dispatch, financial) will appear here as they are completed.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">Submitted</span>
              <span>{new Date(job.createdAt).toLocaleString()}</span>
            </li>
            {job.approvedAt && (
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Approved</span>
                <span>{new Date(job.approvedAt).toLocaleString()}</span>
              </li>
            )}
            {(job.assignedToProduction || job.assignedToHR) && (
              <li className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Assigned to</span>
                <span>
                  {[job.assignedToProduction, job.assignedToHR].filter(Boolean).join(" · ")}
                </span>
              </li>
            )}
            {job.hrReady && (
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">HR ready</span>
                <span>Labor assigned; job can proceed to Inventory</span>
              </li>
            )}
            {job.inventoryReady && (
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Inventory ready</span>
                <span>Materials issued; production can start</span>
              </li>
            )}
            {job.productionStarted && (
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Production started</span>
                <span>{new Date(job.productionStarted).toLocaleString()}</span>
              </li>
            )}
            {(job.status === "qc_pending" || job.status === "qc_done" || job.qcStatus) && (
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">QC</span>
                <span>{job.qcStatus ?? job.status}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
