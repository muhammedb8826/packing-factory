"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { JobOrder, Material, MaterialIssue } from "@/lib/types";
import { api } from "@/lib/api";
import { packingApi } from "@/lib/apiSlice";
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

type InventoryIssueSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryIssueSheet({
  job,
  open,
  onOpenChange,
}: InventoryIssueSheetProps) {
  const dispatch = useDispatch();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [issues, setIssues] = useState<MaterialIssue[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [issuing, setIssuing] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    if (open) api.getMaterials().then(setMaterials);
  }, [open]);

  useEffect(() => {
    if (!job || !open) return;
    api.getMaterialIssues(job.id).then(setIssues);
  }, [job?.id, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedMaterialId("");
      setQuantity("");
    }
    onOpenChange(next);
  };

  const materialById = Object.fromEntries(materials.map((m) => [String(m.id), m]));

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !selectedMaterialId || !quantity) return;
    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }
    const material = materialById[selectedMaterialId];
    if (!material || material.quantityInStock < qty) {
      toast.error("Insufficient stock.");
      return;
    }
    setIssuing(true);
    try {
      await api.createMaterialIssue({
        jobOrderId: job.id,
        materialId: selectedMaterialId,
        quantity: qty,
        issuedAt: new Date().toISOString(),
      });
      await api.updateMaterial(material.id, {
        quantityInStock: material.quantityInStock - qty,
      });
      const list = await api.getMaterialIssues(job.id);
      setIssues(list);
      setSelectedMaterialId("");
      setQuantity("");
      setMaterials(await api.getMaterials());
      toast.success("Materials issued.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to issue");
    } finally {
      setIssuing(false);
    }
  };

  const handleMarkInventoryReady = async () => {
    if (!job) return;
    setMarkingReady(true);
    try {
      await api.updateJobOrder(job.id, {
        inventoryReady: true,
        status: "in_production",
      });
      dispatch(packingApi.util.invalidateTags(["JobOrders"]));
      toast.success(`Job ${job.jobId} inventory ready. Production can start.`);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark ready");
    } finally {
      setMarkingReady(false);
    }
  };

  const canMarkReady = job && !job.inventoryReady && issues.length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Issue materials</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Check stock and issue materials for{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. Update inventory, then
                mark ready so production can start.
              </>
            ) : (
              "Select a job to issue materials."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            <div className="space-y-4">
              <Label>Stock</Label>
              <ul className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                {materials.map((m) => (
                  <li key={String(m.id)} className="flex justify-between">
                    <span>{m.code} – {m.name}</span>
                    <span className="tabular-nums">
                      {m.quantityInStock} {m.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <Label>Issued for this job</Label>
              {issues.length === 0 ? (
                <p className="text-muted-foreground text-sm">No materials issued yet.</p>
              ) : (
                <ul className="space-y-2">
                  {issues.map((i) => (
                    <li
                      key={String(i.id)}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      {materialById[String(i.materialId)]?.name ?? i.materialId} · {i.quantity}{" "}
                      {materialById[String(i.materialId)]?.unit ?? ""} @{" "}
                      {new Date(i.issuedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleIssue} className="space-y-4">
              <Label>Issue material</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={String(m.id)} value={String(m.id)}>
                        {m.code} – {m.name} ({m.quantityInStock} {m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={issuing || !selectedMaterialId || !quantity}
              >
                {issuing ? "Issuing…" : "Issue"}
              </Button>
            </form>

            <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleMarkInventoryReady}
                disabled={!canMarkReady || markingReady}
              >
                {markingReady ? "Updating…" : "Mark inventory ready (start production)"}
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
