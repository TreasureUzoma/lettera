"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "@workspace/ui/components/logo";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { useGetProfile } from "@/hooks/use-auth";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSelectedLayoutSegments } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();
  const { data: profileData, isLoading: profileLoading } = useGetProfile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const isProjectRoute =
    segments[0] === "projects" && !!segments[1] && segments[1] !== "new";
  const projectSlug = isProjectRoute ? segments[1] : null;

  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const mainNavItems: NavItem[] = [
    {
      label: "Projects",
      href: "/projects",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Docs",
      href: "/docs",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  const projectNavItems: NavItem[] = projectSlug
    ? [
        {
          label: "Overview",
          href: `/projects/${projectSlug}`,
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          label: "Posts",
          href: `/projects/${projectSlug}/posts`,
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Analytics",
          href: `/projects/${projectSlug}/analytics`,
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          label: "Subscribers",
          href: `/projects/${projectSlug}/subscribers`,
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Settings",
          href: `/projects/${projectSlug}/settings`,
          icon: <Settings className="w-4 h-4" />,
        },
      ]
    : [];

  const navItems = isProjectRoute ? projectNavItems : mainNavItems;

  const isActive = (href: string) => {
    if (isProjectRoute) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r border-border transition-all duration-300 ease-out flex flex-col z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/projects" className="flex items-center gap-2">
            <Logo />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed ? "rotate-90" : "-rotate-90"
            )}
          />
        </Button>
      </div>

      <Separator />

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <motion.div key={item.href} whileHover={{ x: 4 }}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      <Separator />

      {/* User Section */}
      <div className="p-3 space-y-3">
        <div
          className="relative"
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {profileLoading ? (
            <div className="flex items-center gap-3 px-3">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              {!isCollapsed && <Skeleton className="h-3 flex-1 rounded" />}
            </div>
          ) : (
            <>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage
                    className="rounded-lg"
                    src={
                      profileData?.avatarUrl ||
                      `https://avatar.idolo.dev/${profileData?.email}`
                    }
                    alt="user-avatar"
                  />
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium truncate text-foreground">
                      {profileData?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profileData?.plan ?? "Free"}
                    </p>
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50",
                      isCollapsed && "left-auto right-auto w-48"
                    )}
                  >
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Separator className="my-1" />
                    <Link
                      href="/api/auth/logout"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
