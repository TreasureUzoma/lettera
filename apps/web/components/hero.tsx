import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="p-4 md:p-5 flex items-center justify-center min-h-screen">
      <div className="max-w-3xl space-y-5">
        <h1 className="text-4xl md:text-5xl font-bold text-header">
          the simplest newsletter tool you’ll ever need
        </h1>
        <p className="text-muted-foreground">
          send newsletters, grow your audience, no distractions, privacy first
          and built for developers.
        </p>
        <div className="space-x-6">
          <a href="/login" className="underline hover:text-muted-foreground">
            <span>
              get started for free <ArrowRight size={16} className="inline" />
            </span>
          </a>
          <a href="/docs" className="underline hover:text-muted-foreground">
            read <span className="hidden md:inline">documentations</span>
            <span className="md:hidden">docs</span>
          </a>
        </div>
      </div>
    </section>
  );
};
