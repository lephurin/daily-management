"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileQuery } from "@/features/dashboard/hooks/api-hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/dashboard/notes",
    label: "Daily Notes",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    href: "/dashboard/chat",
    label: "AI Chat",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    href: "/dashboard/members",
    label: "Members",
    icon: <Users className="h-4 w-4" />,
  },
];

function TopNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  const visibleItems = navItems.filter((item) => {
    if (item.href === "/dashboard/chat" || item.href === "/dashboard/members") {
      return isSuperAdmin;
    }
    return true;
  });

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { data: profile } = useProfileQuery();

  const displayName = profile?.name || session?.user?.name || "User";
  const displayAvatar = profile?.avatar_url || session?.user?.image || "";
  const displayPosition = profile?.position || session?.user?.role || "Member";

  const userFallback = displayName.charAt(0).toUpperCase();

  // Derive page title from pathname just in case for mobile
  const pageTitle = (() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/notes")) return "Daily Notes";
    if (pathname.startsWith("/dashboard/chat")) return "AI Chat";
    if (pathname.startsWith("/dashboard/profile")) return "Profile";
    if (pathname.startsWith("/dashboard/members")) return "Members";
    return "Dashboard";
  })();

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfdfd] dark:bg-background/95">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 dark:bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
        <div className="flex h-16 items-center px-4 md:px-6 w-full justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Image
                  src="/dm.png"
                  alt="DM Logo"
                  width={24}
                  height={24}
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <span className="hidden font-bold tracking-tight md:inline-block text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                Daily Management
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
              <TopNavLinks />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

            {/* Profile Route */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-accent transition-all duration-300 border border-transparent hover:border-border"
            >
              <Avatar className="h-8 w-8 border border-primary/10 shadow-sm transition-transform hover:scale-105">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                  {userFallback}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  {displayPosition}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute top-0 right-0 flex h-full w-3/4 max-w-sm flex-col bg-background p-6 shadow-2xl animate-in slide-in-from-right-full duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="font-bold text-lg">Menu</span>
                <span className="text-sm text-muted-foreground">
                  {pageTitle}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <TopNavLinks onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
      </main>

      <div className="w-full">
        <div className="mx-auto w-full max-w-screen-2xl">
          <Footer />
        </div>
      </div>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              ยืนยันการออกจากระบบ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:space-x-4">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl border-border hover:bg-accent">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 focus:ring-red-600 shadow-md shadow-red-500/20 text-white"
              onClick={() => signOut({ redirectTo: "/login" })}
            >
              ออกจากระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
