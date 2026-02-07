"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, generateNextJobId } from "@/lib/api";
import type { JobSpecifications } from "@/lib/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PRODUCT_TYPES: JobSpecifications["productType"][] = [
  "carton",
  "plastic",
  "flexible",
  "other",
];

export function JobOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const [clientId, setClientId] = useState<string>("");
  const [specs, setSpecs] = useState<JobSpecifications>({
    productType: "carton",
    quantity: 0,
    dimensions: "",
    material: "",
    finish: "",
    notes: "",
  });

  useEffect(() => {
    api.getClients().then((list) => {
      setClients(list.map((c) => ({ id: c.id, name: c.name, code: c.code })));
      if (list.length === 1) setClientId(String(list[0].id));
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cId = parseInt(clientId, 10);
    if (!cId || !specs.quantity || specs.quantity <= 0) {
      toast.error("Select a client and enter a valid quantity.");
      return;
    }
    startTransition(async () => {
      try {
        const orders = await api.getJobOrders();
        const jobId = generateNextJobId(orders);
        const newOrder = {
          jobId,
          clientId: cId,
          status: "submitted" as const,
          specifications: specs,
          createdAt: new Date().toISOString(),
          approvedAt: null,
          assignedToProduction: null,
          assignedToHR: null,
          hrReady: false,
          inventoryReady: false,
          productionStarted: null,
          qcStatus: null,
          dispatchReady: null,
          financialCompleted: null,
        };
        await api.createJobOrder(newOrder);
        toast.success("Job order created. Your tracking number: " + jobId);
        router.push(`/client/job-order/success?jobId=${encodeURIComponent(jobId)}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create job order");
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>New Job Order</CardTitle>
        <p className="text-muted-foreground text-sm">
          Submit packaging specifications. You will receive a Job ID for tracking.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger id="client" className="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.code} – {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productType">Product type</Label>
              <Select
                value={specs.productType}
                onValueChange={(v) =>
                  setSpecs((s) => ({ ...s, productType: v as JobSpecifications["productType"] }))
                }
              >
                <SelectTrigger id="productType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={specs.quantity || ""}
                onChange={(e) =>
                  setSpecs((s) => ({ ...s, quantity: parseInt(e.target.value, 10) || 0 }))
                }
                placeholder="e.g. 10000"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (optional)</Label>
              <Input
                id="dimensions"
                value={specs.dimensions ?? ""}
                onChange={(e) => setSpecs((s) => ({ ...s, dimensions: e.target.value }))}
                placeholder="e.g. 30x20x15 cm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Material (optional)</Label>
              <Input
                id="material"
                value={specs.material ?? ""}
                onChange={(e) => setSpecs((s) => ({ ...s, material: e.target.value }))}
                placeholder="e.g. kraft, LDPE"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finish">Finish (optional)</Label>
            <Input
              id="finish"
              value={specs.finish ?? ""}
              onChange={(e) => setSpecs((s) => ({ ...s, finish: e.target.value }))}
              placeholder="e.g. matte, gloss"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={specs.notes ?? ""}
              onChange={(e) => setSpecs((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Special instructions"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting…" : "Submit job order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
