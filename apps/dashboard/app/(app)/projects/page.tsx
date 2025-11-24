"use client";

import { useState } from "react";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { DashboardStats } from "./components/dashboard-stats";
import { ProjectHeader } from "./components/project-header";
import { ProjectList } from "./components/project-list";
import { ProjectsSkeleton } from "./components/projects-skeleton";
import { SearchAndFilter } from "./components/search-and-filter";
import type { DashboardOverview } from "@workspace/validations";
import { useGetProfile } from "@/hooks/use-auth";

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DashboardOverview["sort"]>("newest");

  const { data: dashboardData, isLoading } = useDashboardOverview({
    page,
    limit: 10,
    sort,
  });
  const {data, isLoading:sessionLoading} = useGetProfile();

  if (isLoading || sessionLoading) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="min-h-screen px-4 my-12 flex-col gap-6 flex">
      <ProjectHeader email={data?.email ?? "User"} /> 

      <DashboardStats stats={dashboardData?.data?.stats} />

      <SearchAndFilter onFilterChange={setSort} />

      <ProjectList projects={dashboardData?.data?.projects?.data} />
    </div>
  );
}
