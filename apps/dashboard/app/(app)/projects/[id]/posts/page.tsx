"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEmails, useDeleteEmail } from "@/hooks/use-emails";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
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
import { Loader2, Plus, Trash2, Mail, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProjectPostsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: emails, isLoading } = useEmails(projectId);
  const { mutate: deleteEmail } = useDeleteEmail(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">
            Create and manage your newsletters and posts.
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${projectId}/posts/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            A list of all posts you have created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emails && emails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          email.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {email.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(email.sentAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/projects/${projectId}/posts/${email.id}`}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this post? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEmail(email.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                No posts found. Create your first post to get started.
              </p>
              <Button asChild variant="outline">
                <Link href={`/projects/${projectId}/posts/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
