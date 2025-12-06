"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCreateEmail } from "@/hooks/use-create-email";
import { useProject } from "@/hooks/use-project";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { MarkdownSplitEditor } from "@/components/markdown-split-editor";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectOverviewPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data: project, isLoading: isProjectLoading } = useProject(slug);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const { mutate: createEmail, isPending: isCreating } = useCreateEmail(
    project?.id ?? ""
  );

  const handleSave = (status: "published" | "draft") => {
    if (!project?.id) return;
    if (!subject) {
      toast.error("Please enter a subject");
      return;
    }
    if (!content) {
      toast.error("Please add some content");
      return;
    }

    createEmail(
      {
        subject,
        body: content,
      },
      {
        onSuccess: () => {
          setSubject("");
          setContent("");
          toast.success(
            `Post ${status === "published" ? "published" : "saved as draft"}`
          );
        },
      }
    );
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col pb-6">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground">
            Write a new post or newsletter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isCreating}
          >
            Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <Input
          placeholder="Post Subject"
          className="text-lg font-medium h-12 shrink-0"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <div className="flex-1 min-h-0">
          <MarkdownSplitEditor
            value={content}
            onChange={setContent}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
