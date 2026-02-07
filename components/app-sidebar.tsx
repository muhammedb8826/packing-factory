"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconPackage,
  IconReport,
  IconSettings,
  IconTool,
  IconTruck,
  IconUserCircle,
  IconUsersGroup,
  IconZoomCheck,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Packaging Factory",
    email: "admin@packing-factory.local",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "HR – Assign labor", url: "/hr", icon: IconUsersGroup },
    { title: "Inventory – Issue materials", url: "/inventory", icon: IconPackage },
    { title: "Production", url: "/production", icon: IconTool },
    { title: "QC", url: "/qc", icon: IconZoomCheck },
    { title: "Client: New job order", url: "/client/job-order/new", icon: IconFileDescription },
    { title: "Client: Preferences", url: "/client/preferences", icon: IconUserCircle },
    { title: "Track job", url: "/dashboard", icon: IconTruck },
    { title: "Reporting", url: "/dashboard", icon: IconChartBar },
  ],
  navSecondary: [
    { title: "Settings", url: "/client/preferences", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
  ],
  documents: [
    { name: "Job orders", url: "/dashboard", icon: IconDatabase },
    { name: "Reports", url: "/dashboard", icon: IconReport },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Packaging Factory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
