import { Hero } from "@/components/hero";
import { Pricings } from "@/components/pricings";
import { WhyUs } from "@/components/why-us";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <WhyUs />
      <Pricings />
    </div>
  );
}
