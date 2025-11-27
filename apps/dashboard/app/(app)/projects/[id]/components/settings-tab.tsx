"use client";

import { useDeleteProject } from "@/hooks/use-delete-project";
import { useUpdateProject } from "@/hooks/use-update-project";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "@workspace/validations";
import type { UpdateProject } from "@workspace/validations";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Globe, Loader2, Lock, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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

interface SettingsTabProps {
  project: {
    id: string;
    name: string;
    isPublic: boolean;
    isPrivateAt: string | null;
  };
}

export function SettingsTab({ project }: SettingsTabProps) {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
    project.id
  );
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const form = useForm<UpdateProject>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      isPublic: !project.isPrivateAt,
    },
  });

  function onSubmit(values: UpdateProject) {
    updateProject(values);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your project's general information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              id="project-settings-form"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "cursor-pointer border rounded-lg p-4 flex flex-col gap-2 transition-all hover:border-primary/50",
                          field.value === true
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "bg-card"
                        )}
                        onClick={() => field.onChange(true)}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Anyone can view this project.
                        </p>
                      </div>

                      <div
                        className={cn(
                          "cursor-pointer border rounded-lg p-4 flex flex-col gap-2 transition-all hover:border-primary/50",
                          field.value === false
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "bg-card"
                        )}
                        onClick={() => field.onChange(false)}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Lock className="w-4 h-4" />
                          Private
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only you and your team can view this.
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            type="submit"
            form="project-settings-form"
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Delete Project</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all its data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    project and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteProject(project.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete Project"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
