"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Zap,
  CalendarClock,
  Layers,
  AlertTriangle,
  CreditCard,
  Settings,
  ChevronsUpDown,
  LogOut,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Zap;
  external?: boolean;
  exact?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Overview", href: "/app", icon: LayoutDashboard, exact: true },
  { label: "Jobs", href: "/app/jobs", icon: Zap },
  { label: "Schedules", href: "/app/schedules", icon: CalendarClock },
  { label: "Buffers", href: "/app/buffers", icon: Layers },
  { label: "Failures", href: "/app/failures", icon: AlertTriangle },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Settings", href: "/app/settings", icon: Settings },
  { label: "Docs", href: "/docs", icon: BookOpen, external: true },
];

function isActive(item: NavItem, pathname: string) {
  if (item.external) return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link
          href={item.href}
          onClick={onNavigate}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
            active
              ? "bg-foreground/[0.07] font-medium text-foreground"
              : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground",
          )}
        >
          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-foreground/55")} />
          <span>{item.label}</span>
          {item.external && <ExternalLink className="ml-auto h-3 w-3 text-foreground/25" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppSidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { setOpenMobile } = useSidebar();

  const displayName = user?.fullName || user?.firstName || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = user?.imageUrl;

  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex justify-center px-4 border-b border-foreground/10">
        <Link
          href="/"
          aria-label="Fliq home"
          className="font-display flex items-center text-2xl font-extrabold tracking-tight"
        >
          fliq<span className="text-primary">.</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={closeMobile} />
          ))}
        </SidebarMenu>

        <div className="my-3 mx-3 h-px bg-foreground/10" />

        <SidebarMenu>
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={closeMobile} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 py-3 border-t border-foreground/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-foreground/5">
              <Avatar url={avatarUrl} name={displayName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-foreground/40">{email}</p>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-foreground/30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] border-foreground/10 theme-warm bg-popover text-foreground"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar url={avatarUrl} name={displayName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-foreground/40">{email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-foreground/10" />
            <DropdownMenuItem asChild>
              <Link href="/app/billing" onClick={closeMobile} className="cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" onClick={closeMobile} className="cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground/10" />
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/" })}
              className="cursor-pointer text-red-400 focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Avatar({ url, name }: { url?: string; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} width={32} height={32} className="h-8 w-8 rounded-full" />;
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">
      {name[0]?.toUpperCase()}
    </div>
  );
}
