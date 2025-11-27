"use client";

import { Card } from "@workspace/ui/components/card";
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

      <div className="">
      {projects.map((project) => (
        <Link href={`/projects/${project.id}`}>
        <Card
          key={project.id}
          className="py-4 my-3 hover:bg-accent/50 rounded-sm px-2 cursor-pointer"
        >
          <h3 className="font-medium">{project.name}</h3>
          <p className="text-sm text-muted-foreground">
            {project.description || "No description"}
          </p>
        </Card>
        </Link>
      ))}
      </div>
    </div>
  );
}
