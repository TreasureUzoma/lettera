import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
          <Link href="/login" className="underline hover:text-muted-foreground">
            get started for free <ArrowRight size={16} className="inline" />
          </Link>
          <Link href="/docs" className="underline hover:text-muted-foreground">
            read documentations
          </Link>
        </div>
      </div>
    </section>
  );
};
