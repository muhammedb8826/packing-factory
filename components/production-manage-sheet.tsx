"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JobOrder, Shift, ProductionLog } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type ProductionManageSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductionManageSheet({
  job,
  open,
  onOpenChange,
}: ProductionManageSheetProps) {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [quantityProduced, setQuantityProduced] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [starting, setStarting] = useState(false);
  const [addingLog, setAddingLog] = useState(false);
  const [sendingToQc, setSendingToQc] = useState(false);

  useEffect(() => {
    if (open) api.getShifts().then(setShifts);
  }, [open]);

  useEffect(() => {
    if (!job || !open) return;
    api.getProductionLogs(job.id).then(setLogs);
  }, [job?.id, open]);

  const shiftById = Object.fromEntries(shifts.map((s) => [String(s.id), s]));
  const totalProduced = logs.reduce((sum, l) => sum + l.quantityProduced, 0);
  const targetQty = job?.specifications?.quantity ?? 0;

  const handleStartProduction = async () => {
    if (!job) return;
    setStarting(true);
    try {
      await api.updateJobOrder(job.id, {
        productionStarted: new Date().toISOString(),
      });
      toast.success("Production started.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !selectedShiftId || !quantityProduced) return;
    const qty = parseInt(quantityProduced, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }
    setAddingLog(true);
    try {
      await api.createProductionLog({
        jobOrderId: job.id,
        shiftId: selectedShiftId,
        quantityProduced: qty,
        notes: notes.trim() || undefined,
        loggedAt: new Date().toISOString(),
      });
      const list = await api.getProductionLogs(job.id);
      setLogs(list);
      setSelectedShiftId("");
      setQuantityProduced("");
      setNotes("");
      toast.success("Progress logged.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add log");
    } finally {
      setAddingLog(false);
    }
  };

  const handleSendToQc = async () => {
    if (!job) return;
    setSendingToQc(true);
    try {
      await api.updateJobOrder(job.id, {
        status: "qc_pending",
      });
      toast.success(`Job ${job.jobId} sent to QC.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send to QC");
    } finally {
      setSendingToQc(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Production</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Manage production for{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. Start production, log
                shift-wise progress, then send to QC.
              </>
            ) : (
              "Select a job to manage production."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            {!job.productionStarted ? (
              <div className="space-y-2">
                <Label>Start production</Label>
                <Button
                  onClick={handleStartProduction}
                  disabled={starting}
                >
                  {starting ? "Starting…" : "Start production"}
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Started {new Date(job.productionStarted).toLocaleString()}
              </div>
            )}

            <div className="space-y-2">
              <Label>Progress</Label>
              <p className="text-sm">
                Produced: <strong>{totalProduced.toLocaleString()}</strong> / {targetQty.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <Label>Production logs (shift-wise)</Label>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No logs yet.</p>
              ) : (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {logs.map((l) => (
                    <li
                      key={String(l.id)}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      {shiftById[String(l.shiftId)]?.name ?? l.shiftId} · {l.quantityProduced} units
                      {l.notes ? ` · ${l.notes}` : ""} @{" "}
                      {new Date(l.loggedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {job.productionStarted && (
              <form onSubmit={handleAddLog} className="space-y-4">
                <Label>Log progress</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((s) => (
                        <SelectItem key={String(s.id)} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Quantity"
                    value={quantityProduced}
                    onChange={(e) => setQuantityProduced(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={addingLog || !selectedShiftId || !quantityProduced}
                >
                  {addingLog ? "Adding…" : "Add log"}
                </Button>
              </form>
            )}

            <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
              {job.status === "in_production" && (
                <Button
                  onClick={handleSendToQc}
                  disabled={sendingToQc}
                >
                  {sendingToQc ? "Sending…" : "Send to QC"}
                </Button>
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
