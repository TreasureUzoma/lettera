"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
}

export function ProjectHeader({ projectId, projectName }: ProjectHeaderProps) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: `/projects/${projectId}` },
    { name: "Analytics", href: `/projects/${projectId}/analytics` },
    { name: "Subscribers", href: `/projects/${projectId}/subscribers` },
    { name: "Settings", href: `/projects/${projectId}/settings` },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-lg font-semibold md:text-xl mr-8">{projectName}</h1>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
