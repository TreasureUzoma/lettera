"use client";

import { useProjectApiKeys } from "@/hooks/use-project-api-keys";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ApiKeysTab({ projectId }: { projectId: string }) {
  const { data: apiKeys, isLoading } = useProjectApiKeys(projectId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

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
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(key.publicKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
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
