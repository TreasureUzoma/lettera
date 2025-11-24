"use client";

import numeral from "numeral";

const currencySymbol = "$";

interface DashboardStatsProps {
  stats?: {
    totalProjects: number;
    totalSubscribers: number;
    totalRevenue: number;
    totalPosts: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const dashboardStats = [
    { title: "Total Projects", value: stats?.totalProjects ?? 0 },
    { title: "Total Subscribers", value: stats?.totalSubscribers ?? 0 },
    { title: "Total Posts", value: stats?.totalPosts ?? 0 },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      isCurrency: true,
    },
  ];

  return (
    <div className="border rounded-sm p-6 bg-card">
      <div>
        <div className="flex-between">
          {dashboardStats.map((stat) => (
            <div key={stat.title} className="border-r pr-6 last:border-0">
              <h2 className="text-sm text-muted-foreground font-medium">
                {stat.title}
              </h2>
              <p className="text-xl font-medium">
                {stat.isCurrency
                  ? `${currencySymbol}${numeral(stat.value).format("0,0")}`
                  : numeral(stat.value).format("0,0")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
