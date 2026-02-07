import { JobOrderForm } from "@/components/job-order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewJobOrderPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New job order</h1>
          <p className="text-muted-foreground">
            Submit a new packaging job (carton, plastic, etc.) and get a tracking number.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <JobOrderForm />
    </div>
  );
}
