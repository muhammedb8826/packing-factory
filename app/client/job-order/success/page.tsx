import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JobOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const params = await searchParams;
  const jobId = params?.jobId;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600 dark:text-green-500">
            Job order submitted
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Save your tracking number to check status on the client dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {jobId ? (
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-muted-foreground text-sm">Your Job ID / Tracking number</p>
              <p className="font-mono text-xl font-semibold tracking-wide">{jobId}</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              No tracking number in URL. Go to dashboard to see your recent jobs.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {jobId && (
              <Button asChild>
                <Link href={`/client/track/${encodeURIComponent(jobId)}`}>
                  Track this job
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/client/job-order/new">Create another order</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
