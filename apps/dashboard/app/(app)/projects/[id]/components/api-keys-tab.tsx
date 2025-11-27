"use client";

import { useProjectApiKeys } from "@/hooks/use-project-api-keys";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CopyButton } from "@workspace/ui/components/copy-button";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ApiKeysTab({ projectId }: { projectId: string }) {
  const { data: apiKeys, isLoading } = useProjectApiKeys(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for accessing the Lettera API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys?.map((key) => (
            <div key={key.id} className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Input readOnly value={key.publicKey} />
              </div>
              <CopyButton
                content={key.publicKey}
                onCopy={() => toast.success("Copied to clipboard")}
              />
            </div>
          ))}
          {(!apiKeys || apiKeys.length === 0) && (
            <p className="text-sm text-muted-foreground">No API keys found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
