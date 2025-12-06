"use client";

import { Card } from "@workspace/ui/components/card";
import { CreateProjectForm } from "./components/create-project-form";
import { useGetProfile } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const { data: user, isLoading } = useGetProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-7">
      <Card className="w-full max-w-2xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a new project
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Deploy your new project in one click.
          </p>
        </div>

        <CreateProjectForm />
      </Card>
    </div>
  );
}
