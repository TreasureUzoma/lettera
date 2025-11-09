import { cn } from "@workspace/ui/lib/utils";
import { MailCheckIcon } from "lucide-react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <span className={cn("font-medium text-black dark:text-white", className)}>
      <MailCheckIcon />
    </span>
  );
};

export default Logo;
