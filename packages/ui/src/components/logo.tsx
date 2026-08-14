import { cn } from "@workspace/ui/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        "font-semibold text-lg leading-none tracking-tight text-black dark:text-white",
        className
      )}
    >
      lettera
    </span>
  );
};

export default Logo;
