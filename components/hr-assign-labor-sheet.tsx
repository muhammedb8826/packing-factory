"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { JobOrder, Employee, Shift, LaborAssignment } from "@/lib/types";
import { api } from "@/lib/api";
import { packingApi } from "@/lib/apiSlice";
import { Button } from "@/components/ui/button";
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

type HrAssignLaborSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HrAssignLaborSheet({
  job,
  open,
  onOpenChange,
}: HrAssignLaborSheetProps) {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<LaborAssignment[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    if (open) {
      api.getEmployees().then(setEmployees);
      api.getShifts().then(setShifts);
    }
  }, [open]);

  useEffect(() => {
    if (!job || !open) return;
    api.getLaborAssignments(job.id).then(setAssignments);
  }, [job?.id, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedEmployeeId("");
      setSelectedShiftId("");
    }
    onOpenChange(next);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !selectedEmployeeId || !selectedShiftId) return;
    setAdding(true);
    try {
      await api.createLaborAssignment({
        jobOrderId: job.id,
        employeeId: selectedEmployeeId,
        shiftId: selectedShiftId,
        assignedAt: new Date().toISOString(),
      });
      const list = await api.getLaborAssignments(job.id);
      setAssignments(list);
      setSelectedEmployeeId("");
      setSelectedShiftId("");
      toast.success("Labor assigned.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add assignment");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (assignmentId: number | string) => {
    try {
      await api.deleteLaborAssignment(assignmentId);
      if (job) {
        const list = await api.getLaborAssignments(job.id);
        setAssignments(list);
      }
      toast.success("Assignment removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  const handleMarkHrReady = async () => {
    if (!job) return;
    setMarkingReady(true);
    try {
      await api.updateJobOrder(job.id, {
        hrReady: true,
        status: "inventory_pending",
      });
      dispatch(packingApi.util.invalidateTags(["JobOrders"]));
      toast.success(`Job ${job.jobId} marked HR ready. Job can proceed to Inventory.`);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark ready");
    } finally {
      setMarkingReady(false);
    }
  };

  const employeeById = Object.fromEntries(employees.map((e) => [String(e.id), e]));
  const shiftById = Object.fromEntries(shifts.map((s) => [String(s.id), s]));
  const canMarkReady = job && !job.hrReady && assignments.length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign labor</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Assign shift-wise labor to{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. No labor = job cannot
                start. When done, mark HR ready.
              </>
            ) : (
              "Select a job to assign labor."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            <div className="space-y-4">
              <Label>Current assignments</Label>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No labor assigned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a) => (
                    <li
                      key={String(a.id)}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {employeeById[String(a.employeeId)]?.name ?? a.employeeId} ·{" "}
                        {shiftById[String(a.shiftId)]?.name ?? a.shiftId}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(a.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <Label>Add assignment</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter((e) => e.available).map((e) => (
                      <SelectItem key={String(e.id)} value={String(e.id)}>
                        {e.code} – {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>
              <Button type="submit" variant="secondary" size="sm" disabled={adding || !selectedEmployeeId || !selectedShiftId}>
                {adding ? "Adding…" : "Add assignment"}
              </Button>
            </form>

            <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleMarkHrReady}
                disabled={!canMarkReady || markingReady}
              >
                {markingReady ? "Updating…" : "Mark HR ready (job can start)"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
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
