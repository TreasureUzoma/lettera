"use client";

import { useState, useEffect } from "react";
import { useDashboardStats, useDashboardProjects } from "@/hooks/use-dashboard";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardStatsSkeleton } from "./components/dashboard-stats-skeleton";
import { ProjectHeader } from "./components/project-header";
import { ProjectList } from "./components/project-list";
import { ProjectListSkeleton } from "./components/project-list-skeleton";
import { SearchAndFilter } from "./components/search-and-filter";
import type { DashboardOverview } from "@workspace/validations";
import { useGetProfile } from "@/hooks/use-auth";
import { OnboardingModal } from "./components/onboarding-modal";

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DashboardOverview["sort"]>("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Separate queries - stats don't change with search
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: projectsData, isLoading: isProjectsLoading } =
    useDashboardProjects({
      page,
      limit: 10,
      sort,
      search: debouncedSearch,
    });
  const { data, isLoading: sessionLoading } = useGetProfile();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isStatsLoading && statsData?.stats?.totalProjects === 0) {
      setShowOnboarding(true);
    }
  }, [isStatsLoading, statsData]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen px-4 my-12 flex-col gap-6 flex">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <DashboardStatsSkeleton />
        <div className="h-12 bg-muted animate-pulse rounded" />
        <ProjectListSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 my-12 flex-col gap-6 flex">
      <ProjectHeader email={data?.email ?? "User"} />

      {isStatsLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <DashboardStats stats={statsData?.stats} />
      )}

      <SearchAndFilter
        onFilterChange={setSort}
        onSearchChange={setSearch}
        searchValue={search}
      />

      {isProjectsLoading ? (
        <ProjectListSkeleton />
      ) : (
        <ProjectList projects={projectsData?.projects?.data} />
      )}

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
    </div>
  );
}
