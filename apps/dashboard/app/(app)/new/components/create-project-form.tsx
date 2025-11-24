"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@workspace/validations";
import type { NewProject } from "@workspace/validations";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useMutation } from "@tanstack/react-query";
import api from "@workspace/axios";
import { useRouter } from "next/navigation";
import { Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";

export function CreateProjectForm() {
  const router = useRouter();
  const form = useForm<NewProject>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      fromEmail: "",
      isPublic: true,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: NewProject) => {
      const res = await api.post("/projects/new", values);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      router.push("/projects");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create project");
    },
  });

  function onSubmit(values: NewProject) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="fromEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Email</FormLabel>
              <FormControl>
                <Input placeholder="noreply@myproject.com" {...field} />
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

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Project
          </Button>
        </div>
      </form>
    </Form>
  );
}
