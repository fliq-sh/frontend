import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LowBalanceBanner from "@/components/dashboard/LowBalanceBanner";
import { BalanceProvider } from "@/components/dashboard/BalanceContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BalanceProvider>
      <SidebarProvider>
        <div className="theme-warm flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader />
            <LowBalanceBanner />
            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </BalanceProvider>
  );
}
