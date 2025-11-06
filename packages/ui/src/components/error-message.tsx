import { cn } from "@workspace/ui/lib/utils";

interface ErrorParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export const ErrorParagraph = ({
  children,
  className,
}: ErrorParagraphProps) => {
  return (
    <p className={cn("text-sm text-destructive mt-1", className)}>{children}</p>
  );
};
