"use client";

import numeral from "numeral";
import { FolderKanban, Users, FileText, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

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
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
    },
    {
      title: "Total Subscribers",
      value: stats?.totalSubscribers ?? 0,
      icon: Users,
    },
    { title: "Total Posts", value: stats?.totalPosts ?? 0, icon: FileText },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      isCurrency: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {stat.isCurrency
                ? `${currencySymbol}${numeral(stat.value).format("0,0")}`
                : numeral(stat.value).format("0,0")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
