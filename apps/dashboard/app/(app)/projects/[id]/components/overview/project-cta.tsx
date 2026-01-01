import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { PenLine, Send, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ProjectCTAProps {
  project: any;
  stats?: {
    totalSubscribers: number;
    lastPostSent: string | null;
  };
}

export function ProjectCTA({ project, stats }: ProjectCTAProps) {
  const params = useParams();
  const slug = params.id as string;

  // Logic for context-aware CTA
  let cta = {
    title: "Write your first post",
    description:
      "You're all set up! Share your first newsletter with your subscribers.",
    buttonText: "Create Post",
    icon: PenLine,
    href: `/projects/${slug}/posts/new`,
  };

  const lastSent = stats?.lastPostSent ? new Date(stats.lastPostSent) : null;
  const isInactive =
    !lastSent ||
    new Date().getTime() - lastSent.getTime() > 14 * 24 * 60 * 60 * 1000;

  if (stats?.totalSubscribers === 0) {
    cta = {
      title: "Share your signup link",
      description:
        "You don't have any subscribers yet. Share your signup page to start growing.",
      buttonText: "Copy Link",
      icon: Share2,
      href: `/projects/${slug}/settings`,
    };
  } else if (isInactive) {
    cta = {
      title: "Send your next newsletter",
      description:
        "It's been a while since your last update. Keep your audience engaged.",
      buttonText: "Send Post",
      icon: Send,
      href: `/projects/${slug}/posts/new`,
    };
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 w-fit rounded-lg bg-neutral-800">
            <cta.icon className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{cta.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {cta.description}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Button
            className="w-full bg-white text-black hover:bg-neutral-200"
            asChild
          >
            <Link href={cta.href}>
              {cta.buttonText}
              <cta.icon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
