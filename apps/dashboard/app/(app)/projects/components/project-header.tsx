"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

interface ProjectHeaderProps {
  email?: string | null;
}

export function ProjectHeader({ email }: ProjectHeaderProps) {
  return (
    <div className="flex-between">
      <h1 className="text-2xl md:text-3xl font-semibold">
        {email}'s projects
      </h1>
      <Button asChild>
        <Link href="/new">New Project</Link>
      </Button>
    </div>
  );
}
