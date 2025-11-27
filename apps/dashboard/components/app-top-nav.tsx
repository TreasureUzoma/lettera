"use client";

import React from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import { AnimatedTabs } from "./animated-tabs";
import Logo from "@workspace/ui/components/logo";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { useGetProfile } from "@/hooks/use-auth";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { usePathname, useParams } from "next/navigation";
import { ProjectSwitcher } from "./project-switcher";

export default function AppTopNav() {
  const [scrollY, setScrollY] = React.useState(0);
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const globalTabs = [
    { label: "Projects", value: "projects", href: "/projects" },
    { label: "Billings", value: "billings", href: "/billings" },
    { label: "Integrations", value: "integrations", href: "/integrations" },
    { label: "Settings", value: "settings", href: "/settings" },
    { label: "Docs", value: "docs", href: "/docs" },
  ];

  const projectTabs = [
    { label: "Overview", value: "overview", href: `/projects/${projectId}` },
    {
      label: "Analytics",
      value: "analytics",
      href: `/projects/${projectId}/analytics`,
    },
    {
      label: "Subscribers",
      value: "subscribers",
      href: `/projects/${projectId}/subscribers`,
    },
    {
      label: "Settings",
      value: "settings",
      href: `/projects/${projectId}/settings`,
    },
  ];

  const isProjectRoute = pathname.startsWith("/projects/") && projectId;
  const tabs = isProjectRoute ? projectTabs : globalTabs;

  const { data: profileData, isLoading: profileLoading } = useGetProfile();
  return (
    <>
      <header className="w-full bg-background relative">
        <motion.div
          className="fixed top-0 left-0 z-50 pt-5 pl-5"
          animate={{
            scale: Math.max(0.8, 1 - scrollY * 0.006),
          }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
        >
          <Link href="/">
            <Logo />
          </Link>
        </motion.div>

        <div className="flex justify-between px-5 items-center pt-3 pb-0 pl-14">
          <div className="flex items-center gap-2">
            <Separator
              orientation="vertical"
              className={cn(
                "h-7 w-[2px] rotate-[12deg] origin-center bg-muted-foreground/20 transition-all duration-500"
              )}
            />
            <div className="flex flex-col text-sm leading-tight">
              {profileLoading ? (
                <Skeleton className="w-24 h-3 rounded-sm" />
              ) : (
                <span className="text-foreground font-medium">
                  {profileData?.email || "user@email.com"}
                </span>
              )}
            </div>
            {isProjectRoute && (
              <>
                <Separator
                  orientation="vertical"
                  className={cn(
                    "h-7 w-[2px] rotate-[12deg] origin-center bg-muted-foreground/20 transition-all duration-500"
                  )}
                />
                <ProjectSwitcher />
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="scale-95 rounded-full"
            >
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            {profileLoading ? (
              <Skeleton className="rounded-full w-8.5 h-8.5" />
            ) : (
              <Avatar>
                <AvatarImage
                  className="rounded-lg"
                  src={
                    profileData?.avatarUrl ||
                    `https://avatar.vercel.sh/${profileData?.email}`
                  }
                  alt="lettera-user"
                />
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Navigation with animated tabs */}
      <div className="sticky top-0 bg-background overflow-x-hidden border-b border-border">
        <div className="flex justify-center items-center">
          <motion.div
            className="flex justify-center flex-1"
            animate={{
              x: Math.min(scrollY * 0.5, 40), // Move 0.5px right per 1px scroll, max 40px
            }}
            transition={{
              duration: 0.05,
              ease: "linear",
            }}
          >
            <AnimatedTabs tabs={tabs} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
