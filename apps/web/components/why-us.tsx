import { meta } from "@workspace/constants/meta";
import { Code2 } from "lucide-react";

export const WhyUs = () => {
  return (
    <section className="p-4 md:p-5 flex items-center justify-center max-w-3xl mx-auto">
      <div className="flex flex-col space-y-8 md:space-y-10">
        <h2 className="text-3xl md:text-4xl font-bold">why choose us?</h2>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            built by developers, for developers
          </h3>
          <p>
            every decision behind {meta.name} was made by people who actually
            write code daily. we know the pain of bloated dashboards, confusing
            uis, and slow platforms. that’s why we’ve stripped away everything
            unnecessary and built something that feels fast, intuitive, and
            purposeful.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            open-source at the core
          </h3>
          <p>
            {meta.name} is <b>completely open-source</b>. you can read the code,
            suggest changes, and even host it yourself if you prefer.
            transparency isn’t a marketing term here — it’s our foundation.
            you’ll always know what’s running behind the scenes, and your trust
            won’t rely on hidden logic or closed systems.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            small team, fast iterations
          </h3>
          <p>
            we’re a <b>small, focused team</b> that moves quickly. no endless
            meetings or slow release cycles — we ship improvements as soon as
            they’re stable. this means you get new features, performance
            upgrades, and fixes right when they’re ready, not months later.
          </p>
          <p>
            we listen closely to user feedback and treat good ideas like pull
            requests — merge fast, test hard, and make it better. it’s how
            modern development should be.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            performance, reliability, simplicity
          </h3>
          <p>
            we care deeply about <b>speed and reliability</b>. every part of our
            stack is optimized to respond instantly and scale gracefully. we
            believe tools should empower you to create more, not slow you down
            with endless loading screens or unintuitive workflows.
          </p>
          <p>
            our philosophy is simple: fewer clicks, fewer errors, and fewer
            headaches. just pure, clean productivity that lets you focus on what
            really matters — building.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            perfect for businesses
          </h3>
          <p>
            whether you’re a startup or an established brand, {meta.name} fits
            right into your workflow. we offer the tools you need to scale,
            manage subscribers, automate communication, and deliver consistent
            performance without breaking the bank.
          </p>
          <p>
            reliability isn’t optional — it’s the standard. with predictable
            uptime and developer-focused tooling, your team can move faster
            while staying confident that everything works when it matters most.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            made for creators
          </h3>
          <p>
            {meta.name} isn’t just for developers. it’s for <b>creators</b> who
            care about their audience, their content, and their freedom. from
            paid subscriptions to audience insights, we give you the power to
            own your growth without relying on algorithms or middlemen.
          </p>
          <p>
            create freely, build your community, and let the platform handle the
            hard parts — from email delivery to subscriber management — so you
            can focus entirely on your craft.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            apis and integrations <Code2 className="inline" />
          </h3>
          <p>
            we know that flexibility is key. that’s why {meta.name} comes with
            <b> developer-friendly apis</b> designed for seamless integration.
            whether you’re connecting custom dashboards, automating workflows,
            or syncing data with your favorite tools, our api makes it simple
            and reliable.
          </p>
          <p>
            plug into your existing systems with ease, or extend our platform to
            fit your unique needs — the power is entirely in your hands.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            community over competition
          </h3>
          <p>
            we’re not trying to outspend or out-hype anyone. we believe in{" "}
            <b>open collaboration and community-driven growth.</b> the best
            products are built in the open, improved by the people who use them,
            and shaped by real-world needs. that’s exactly what {meta.name}{" "}
            represents.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            join the movement
          </h3>
          <p>
            if you value <b>speed, openness, and developer-first design</b>,
            you’ll feel right at home here. join us, build with us, and help
            define what modern developer tools should look like.
          </p>
        </div>
      </div>
    </section>
  );
};
