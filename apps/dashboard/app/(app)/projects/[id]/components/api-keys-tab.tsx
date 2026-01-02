import { useState } from "react";
import {
  useProjectApiKeys,
  useCreateProjectApiKey,
  useDeleteProjectApiKey,
} from "@/hooks/use-project-api-keys";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CopyButton } from "@workspace/ui/components/copy-button";
import { Input } from "@workspace/ui/components/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Label } from "@workspace/ui/components/label";

export function ApiKeysTab({ projectId }: { projectId: string }) {
  const { data: apiKeys, isLoading } = useProjectApiKeys(projectId);
  const { mutate: createApiKey, isPending: isCreating } =
    useCreateProjectApiKey(projectId);
  const { mutate: deleteApiKey, isPending: isDeleting } =
    useDeleteProjectApiKey(projectId);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreate = () => {
    createApiKey(undefined, {
      onSuccess: (data) => {
        setNewKey(data.secretKey);
      },
    });
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for accessing the Lettera API.
            </CardDescription>
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create New Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {apiKeys?.map((key) => (
            <div key={key.id} className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Input readOnly value={key.publicKey} className="font-mono" />
              </div>
              <CopyButton
                content={key.publicKey}
                onCopy={() => toast.success("Copied to clipboard")}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this API key? This action
                      cannot be undone and will immediately revoke access for
                      any application using this key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteApiKey(key.id)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          {(!apiKeys || apiKeys.length === 0) && (
            <p className="text-sm text-muted-foreground">No API keys found.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!newKey} onOpenChange={(open) => !open && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created. Please copy it now as you will
              not be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={newKey || ""}
                  type="password"
                  className="font-mono"
                />
                <CopyButton
                  content={newKey || ""}
                  onCopy={() => toast.success("Secret key copied")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
