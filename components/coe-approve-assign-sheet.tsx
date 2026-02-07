"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobOrder } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type CoeApproveAssignSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CoeApproveAssignSheet({
  job,
  open,
  onOpenChange,
}: CoeApproveAssignSheetProps) {
  const router = useRouter();
  const [assignedToProduction, setAssignedToProduction] = useState("");
  const [assignedToHR, setAssignedToHR] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAssignedToProduction("");
      setAssignedToHR("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    try {
      await api.updateJobOrder(job.id, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        assignedToProduction: assignedToProduction.trim() || null,
        assignedToHR: assignedToHR.trim() || null,
      });
      toast.success(`Job ${job.jobId} approved and assigned.`);
      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Approve & assign</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Approve job <span className="font-mono font-medium">{job.jobId}</span> and assign to
                Production and HR. Status will change to &quot;approved&quot;.
              </>
            ) : (
              "Select a job to approve."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignedToProduction">Assigned to Production</Label>
                <Input
                  id="assignedToProduction"
                  value={assignedToProduction}
                  onChange={(e) => setAssignedToProduction(e.target.value)}
                  placeholder="e.g. Line A, Shift 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToHR">Assigned to HR</Label>
                <Input
                  id="assignedToHR"
                  value={assignedToHR}
                  onChange={(e) => setAssignedToHR(e.target.value)}
                  placeholder="e.g. HR Team / Contact name"
                />
              </div>
            </div>
            <SheetFooter className="mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Approve & assign"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
