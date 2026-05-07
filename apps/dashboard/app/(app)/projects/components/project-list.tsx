"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { Project } from "@workspace/constants/types/projects";

interface ProjectListProps {
  projects?: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div>
        <h2 className="font-semibold mb-4">Projects</h2>
        <div className="text-center py-10 text-muted-foreground">
          No projects found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold mb-4">Projects</h2>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link href={`/projects/${project.slug}`} key={project.id}>
            <Card className="h-full py-4 hover:bg-accent/50 rounded-sm px-4 cursor-pointer transition-colors">
              <CardContent className="space-y-2">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "No description"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
