"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { CopyButton } from "@workspace/ui/components/copy-button";
import { toast } from "sonner";

export const ProjectIdTab = ({ projectId }: { projectId: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project ID</CardTitle>
        <CardDescription>
          Your project ID is used to identify your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input defaultValue={projectId} disabled />
          <CopyButton
            content={projectId}
            onCopy={() => toast.success("Copied to clipboard")}
          />
        </div>
      </CardContent>
    </Card>
  );
};
