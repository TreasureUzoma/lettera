"use client";

import { useGetProfile } from "@/hooks/use-auth";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import Link from "next/link";

const dummyDashboardStats = [
  { title: "Total Projects", value: 12 },
  { title: "Total Subscribers", value: 2343 },
  { title: "Total Posts", value: 445 },
  { title: "Total Revenue", value: "$12,343" },
];

export default function ProjectsPage() {
  const { data: profileData, isLoading: profileLoading } = useGetProfile();
  return (
    <div className="min-h-screen px-4 my-12 bg-card flex-col gap-6 flex">
      <div className="flex-between">
        <h1 className="text-2xl md:text-3xl font-semibold">
          {profileData?.email}'s projects
        </h1>
        <Button asChild>
          <Link href="/new">New Project</Link>
        </Button>
      </div>
      <div className="border rounded-sm p-6">
        <div>
          <div className="flex-between">
            {dummyDashboardStats.map((stat) => (
              <div key={stat.title} className={`border-r pr-6 last:border-0`}>
                <h2 className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </h2>
                <p className="text-xl font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative w-full">
        <Input placeholder="Search projects..." className="pl-10 py-5" />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      </div>
      <div>
        <h2 className="font-semibold mb-4">Projects</h2>
        {[1, 2].map((project) => (
          <Card
            key={project}
            className="py-4 my-3 hover:bg-accent/50 rounded-sm px-2 cursor-pointer"
          >
            <h3 className="font-medium">Project {project}</h3>
            <p className="text-sm text-muted-foreground">
              This is a sample project description.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
