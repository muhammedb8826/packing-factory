"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { JobOrder, QcRecord } from "@/lib/types";
import { api } from "@/lib/api";
import { packingApi } from "@/lib/apiSlice";
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

type QcRecordSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QcRecordSheet({
  job,
  open,
  onOpenChange,
}: QcRecordSheetProps) {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<QcRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<"pass" | "rework" | null>(null);

  useEffect(() => {
    if (!job || !open) return;
    api.getQcRecords(job.id).then(setRecords);
  }, [job?.id, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setNotes("");
    onOpenChange(next);
  };

  const handleRecord = async (result: "pass" | "rework") => {
    if (!job) return;
    setSubmitting(result);
    try {
      await api.createQcRecord({
        jobOrderId: job.id,
        result,
        notes: notes.trim() || undefined,
        checkedAt: new Date().toISOString(),
      });
      await api.updateJobOrder(job.id, {
        qcStatus: result,
        status: result === "pass" ? "qc_done" : "qc_pending",
      });
      dispatch(packingApi.util.invalidateTags(["JobOrders"]));
      if (result === "pass") {
        toast.success(`Job ${job.jobId} passed QC. Ready for dispatch.`);
        handleOpenChange(false);
      } else {
        toast.success("QC rework recorded. Job remains in QC until pass.");
        const list = await api.getQcRecords(job.id);
        setRecords(list);
        setNotes("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record QC");
    } finally {
      setSubmitting(null);
    }
  };

  const canRecord = job && job.status === "qc_pending";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quality control</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Record QC check for{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. Pass
                or mark rework with notes.
              </>
            ) : (
              "Select a job to record QC."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            <div className="space-y-4">
              <Label>QC history</Label>
              {records.length === 0 ? (
                <p className="text-muted-foreground text-sm">No QC records yet.</p>
              ) : (
                <ul className="max-h-32 space-y-2 overflow-y-auto">
                  {records.map((r) => (
                    <li
                      key={String(r.id)}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        r.result === "pass"
                          ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                          : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                      }`}
                    >
                      <span className="font-medium capitalize">{r.result}</span>
                      {r.notes && ` · ${r.notes}`} @{" "}
                      {new Date(r.checkedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {canRecord && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="qc-notes">Notes (optional, required for rework)</Label>
                  <Input
                    id="qc-notes"
                    placeholder="Defects, rework instructions…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => handleRecord("pass")}
                    disabled={!!submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting === "pass" ? "Recording…" : "Pass"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleRecord("rework")}
                    disabled={!!submitting}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50"
                  >
                    {submitting === "rework" ? "Recording…" : "Rework"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Close
                  </Button>
                </SheetFooter>
              </>
            )}
            {!canRecord && job.qcStatus && (
              <p className="text-muted-foreground text-sm">
                QC result: <span className="capitalize font-medium">{job.qcStatus}</span>
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
