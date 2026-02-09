import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardJobOrders } from "@/components/dashboard-job-orders";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Job orders
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    All job orders (COE/Management view). Approve and assign to
                    Production & HR.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/client/job-order/new">New job order</Link>
                </Button>
              </div>
              <div className="px-4 lg:px-6">
                <DashboardJobOrders />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
