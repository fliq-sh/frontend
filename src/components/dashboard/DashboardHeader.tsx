"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ROUTE_TITLES: Record<string, string> = {
  "/app": "Jobs",
  "/app/schedules": "Schedules",
  "/app/buffers": "Buffers",
  "/app/executions": "Executions",
  "/app/settings": "Settings",
  "/app/billing": "Billing",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] || "Dashboard";

  return (
    <header className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
      <SidebarTrigger />
      <div className="h-5 w-px bg-white/10" />
      <h1 className="text-sm font-medium text-white/80">{title}</h1>
    </header>
  );
}
