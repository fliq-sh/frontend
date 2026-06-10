import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { BalanceProvider } from "@/components/dashboard/BalanceContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BalanceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </BalanceProvider>
  );
}
