"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/hooks/use-project";
import { useProjectAnalytics } from "@/hooks/use-project-analytics";
import { Loader2 } from "lucide-react";
import { KPICards } from "./components/overview/kpi-cards";
import { GrowthChart } from "./components/overview/growth-chart";
import { ActivityFeed } from "./components/overview/activity-feed";
import { LatestPost } from "./components/overview/latest-post";
import { ProjectCTA } from "./components/overview/project-cta";

export default function ProjectOverviewPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data: project, isLoading: isProjectLoading } = useProject(slug);
  const { data: analytics, isLoading: isAnalyticsLoading } =
    useProjectAnalytics(project?.id ?? "");

  if (isProjectLoading || isAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-xl font-semibold">Project not found</p>
        <p className="text-muted-foreground text-sm">
          The project you're looking for doesn't exist or you don't have access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            A snapshot of your newsletter's health and activity.
          </p>
        </div>
      </div>

      <KPICards stats={analytics?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart data={analytics?.chartData} />
        </div>
        <div>
          <ActivityFeed activities={analytics?.activity} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LatestPost post={analytics?.lastPost} />
        <ProjectCTA project={project} stats={analytics?.stats} />
      </div>
    </div>
  );
}
