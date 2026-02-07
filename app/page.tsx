import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-8 font-sans dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Packaging Factory
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Job orders, production, and tracking for carton, plastic, and flexible packaging.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:opacity-90"
        >
          Dashboard
        </Link>
        <Link
          href="/client/job-order/new"
          className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          New job order
        </Link>
        <Link
          href="/client/preferences"
          className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Client preferences
        </Link>
      </div>
      <p className="text-center text-muted-foreground text-sm">
        Run <code className="rounded bg-muted px-1.5 py-0.5">npm run server</code> for JSON Server (port 3001).
      </p>
    </div>
  );
}
