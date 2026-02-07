"use client";

import { useState } from "react";
import Link from "next/link";
import type { JobOrder } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoeApproveAssignSheet } from "@/components/coe-approve-assign-sheet";
import { HrAssignLaborSheet } from "@/components/hr-assign-labor-sheet";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "secondary",
  approved: "outline",
  hr_pending: "secondary",
  inventory_pending: "secondary",
  in_production: "default",
  qc_pending: "secondary",
  qc_done: "outline",
  ready_dispatch: "outline",
  dispatched: "outline",
  financial_completed: "outline",
};

export function JobOrdersList({ initialData }: { initialData: JobOrder[] }) {
  const [approveJob, setApproveJob] = useState<JobOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [laborJob, setLaborJob] = useState<JobOrder | null>(null);
  const [hrSheetOpen, setHrSheetOpen] = useState(false);

  const openApproveSheet = (job: JobOrder) => {
    setApproveJob(job);
    setSheetOpen(true);
  };

  const openHrSheet = (job: JobOrder) => {
    setLaborJob(job);
    setHrSheetOpen(true);
  };

  if (initialData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
        No job orders yet. Create one from the sidebar or{" "}
        <Link href="/client/job-order/new" className="text-primary underline">
          New job order
        </Link>
        .
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>HR ready</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono font-medium">{job.jobId}</TableCell>
                <TableCell>{job.clientId}</TableCell>
                <TableCell>{job.specifications.productType}</TableCell>
                <TableCell>{job.specifications.quantity.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[job.status] ?? "secondary"}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {job.status === "approved" || job.assignedToProduction || job.assignedToHR
                    ? [job.assignedToProduction, job.assignedToHR].filter(Boolean).join(" / ") || "—"
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {job.hrReady ? (
                    <Badge variant="outline" className="font-normal">Yes</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  {job.status === "submitted" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openApproveSheet(job)}
                    >
                      Approve & assign
                    </Button>
                  )}
                  {job.status === "approved" && !job.hrReady && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openHrSheet(job)}
                    >
                      Assign labor
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/client/track/${encodeURIComponent(job.jobId)}`}>
                      Track
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CoeApproveAssignSheet
        job={approveJob}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <HrAssignLaborSheet
        job={laborJob}
        open={hrSheetOpen}
        onOpenChange={setHrSheetOpen}
      />
    </>
  );
}
