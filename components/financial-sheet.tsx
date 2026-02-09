"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { JobOrder, Invoice } from "@/lib/types";
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

type FinancialSheetProps = {
  job: JobOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FinancialSheet({
  job,
  open,
  onOpenChange,
}: FinancialSheetProps) {
  const dispatch = useDispatch();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceType, setInvoiceType] = useState<"advance" | "full">("full");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (!job || !open) return;
    api.getInvoicesByJobOrderId(job.id).then(setInvoices);
  }, [job?.id, open]);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setAdding(true);
    try {
      await api.createInvoice({
        jobOrderId: job.id,
        clientId: job.clientId,
        amount: num,
        type: invoiceType,
        status: "pending",
      });
      const list = await api.getInvoicesByJobOrderId(job.id);
      setInvoices(list);
      setAmount("");
      toast.success("Invoice created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setAdding(false);
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await api.updateInvoice(invoice.id, {
        status: "paid",
        paidAt: new Date().toISOString(),
      });
      if (job) {
        const list = await api.getInvoicesByJobOrderId(job.id);
        setInvoices(list);
      }
      toast.success("Invoice marked paid.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleMarkFinancialCompleted = async () => {
    if (!job) return;
    setMarkingComplete(true);
    try {
      await api.updateJobOrder(job.id, {
        status: "financial_completed",
        financialCompleted: new Date().toISOString(),
      });
      dispatch(packingApi.util.invalidateTags(["JobOrders"]));
      toast.success(`Job ${job.jobId} marked financial completed.`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setMarkingComplete(false);
    }
  };

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const canMarkComplete =
    job &&
    job.status !== "financial_completed" &&
    (job.status === "dispatched" || job.status === "ready_dispatch" || job.status === "qc_done");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Financial</SheetTitle>
          <SheetDescription>
            {job ? (
              <>
                Billing for{" "}
                <span className="font-mono font-medium">{job.jobId}</span>. Add
                advance or full payment invoices, mark paid, then mark job
                financial completed.
              </>
            ) : (
              "Select a job to manage billing."
            )}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className="flex flex-1 flex-col gap-6 py-4">
            <div className="space-y-2 text-sm">
              <p>
                Total invoiced: <strong>{totalInvoiced.toLocaleString()}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <Label>Invoices</Label>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No invoices yet.</p>
              ) : (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {invoices.map((inv) => (
                    <li
                      key={String(inv.id)}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {inv.type} · {inv.amount.toLocaleString()} ·{" "}
                        {inv.status === "paid" ? (
                          <span className="text-green-600 dark:text-green-500">
                            Paid {inv.paidAt && new Date(inv.paidAt).toLocaleDateString()}
                          </span>
                        ) : (
                          "Pending"
                        )}
                      </span>
                      {inv.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPaid(inv)}
                        >
                          Mark paid
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4">
              <Label>Add invoice</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Select
                  value={invoiceType}
                  onValueChange={(v) => setInvoiceType(v as "advance" | "full")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">Advance</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={adding || !amount}
              >
                {adding ? "Adding…" : "Add invoice"}
              </Button>
            </form>

            <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-col">
              {canMarkComplete && (
                <Button
                  onClick={handleMarkFinancialCompleted}
                  disabled={markingComplete}
                >
                  {markingComplete ? "Updating…" : "Mark financial completed"}
                </Button>
              )}
              {job.status === "financial_completed" && job.financialCompleted && (
                <p className="text-muted-foreground text-sm">
                  Financial completed {new Date(job.financialCompleted).toLocaleString()}
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
