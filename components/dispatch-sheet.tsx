"use client";

import { useRouter } from "next/navigation";
import type { JobOrder } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type DispatchSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DispatchSheet({
  job,
  open,
  onOpenChange,
}: DispatchSheetProps) {
  const router = useRouter();

  const handleMarkReadyForDispatch = async () => {
    if (!job) return;
    try {
      await api.updateJobOrder(job.id, {
        status: "ready_dispatch",
        dispatchReady: new Date().toISOString(),
      });
      toast.success(`Job ${job.jobId} marked ready for dispatch. Client can be notified per preferences.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleMarkDispatched = async () => {
    if (!job) return;
    try {
      await api.updateJobOrder(job.id, {
        status: "dispatched",
        dispatchedAt: new Date().toISOString(),
      });
      toast.success(`Job ${job.jobId} marked as dispatched. Client notification sent per preferences.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const canMarkReady = job?.status === "qc_done";
  const canMarkDispatched = job?.status === "ready_dispatch";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Dispatch</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Consolidate finished goods for{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. Mark
                ready for dispatch, then mark dispatched when shipped. Client is
                notified per their preferences (email/SMS/push).
              </>
            ) : (
              "Select a job to manage dispatch."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            <div className="space-y-2 text-sm">
              {job.dispatchReady && (
                <p className="text-muted-foreground">
                  Ready for dispatch: {new Date(job.dispatchReady).toLocaleString()}
                </p>
              )}
              {job.dispatchedAt && (
                <p className="text-muted-foreground">
                  Dispatched: {new Date(job.dispatchedAt).toLocaleString()}
                </p>
              )}
            </div>

            <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
              {canMarkReady && (
                <Button onClick={handleMarkReadyForDispatch}>
                  Mark ready for dispatch
                </Button>
              )}
              {canMarkDispatched && (
                <Button onClick={handleMarkDispatched}>
                  Mark dispatched
                </Button>
              )}
              {job.status === "dispatched" && (
                <p className="text-muted-foreground text-sm">
                  This job has been dispatched.
                </p>
              )}
              {!canMarkReady && !canMarkDispatched && job.status !== "dispatched" && (
                <p className="text-muted-foreground text-sm">
                  Complete QC first (status must be qc_done) to mark ready for dispatch.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
