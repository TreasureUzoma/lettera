"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion, Transition } from "motion/react";
import { cn } from "@workspace/ui/lib/utils";

export interface Tab {
  label: string;
  value: string;
  subRoutes?: string[];
  href: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab?: string;
}

const transition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

export function AnimatedTabs({ tabs, activeTab }: AnimatedTabsProps) {
  const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(
    null
  );

  return (
    <div className="relative flex w-full items-baseline justify-start overflow-x-auto no-scrollbar">
      <nav
        className="flex flex-shrink-0 justify-center items-center relative"
        onPointerLeave={() => setHoveredTabIndex(null)}
      >
        {tabs.map((item, i) => {
          const isActive = activeTab === item.value;

          return (
            <Link
              key={item.value}
              href={item.href}
              className={cn(
                "relative flex items-center h-10 px-4 z-20 cursor-pointer select-none transition-colors",
                "text-sm font-medium",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onPointerEnter={() => setHoveredTabIndex(i)}
            >
              <span className="relative z-20">{item.label}</span>

              {/* Hover highlight */}
              <AnimatePresence>
                {hoveredTabIndex === i && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute inset-x-1 inset-y-1.5 rounded-md bg-accent/50 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                  />
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground z-30"
                  transition={transition}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
