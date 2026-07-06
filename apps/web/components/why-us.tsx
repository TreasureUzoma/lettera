import { meta } from "@workspace/constants/meta";
import { Code2 } from "lucide-react";

export const WhyUs = () => {
  return (
    <section className="p-4 md:p-5 flex items-center justify-center max-w-3xl mx-auto">
      <div className="flex flex-col space-y-8 md:space-y-10">
        <h2 className="text-3xl md:text-4xl font-bold">what you get</h2>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">markdown editor</h3>
          <p>
            write content in markdown and publish it instantly. no complicated
            wysiwyg editors or bloated formatting tools. just clean, simple
            writing that gets out of your way.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            subscriber management
          </h3>
          <p>
            organize and manage your entire subscriber base in one place. view
            segments, track subscription status, and handle everything from
            signup to retention without switching between tools.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">segmentation</h3>
          <p>
            target the right audience with powerful segmentation tools. create
            segments based on behavior, interests, or custom attributes. send
            targeted campaigns that actually resonate with your subscribers.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            scheduled sending
          </h3>
          <p>
            plan ahead by scheduling your content to go out at the perfect time.
            set it once and let {meta.name} handle the delivery. no more
            remembering to send manually or worrying about timezone issues.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">custom domains</h3>
          <p>
            use your own domain instead of a subdomain. build your brand with a
            professional presence. your subscribers see your domain, not ours.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">
            rest api <Code2 className="inline" />
          </h3>
          <p>
            build custom integrations and automate your workflow. our{" "}
            <b>developer-friendly api</b> lets you connect {meta.name} to any
            system. sync data, trigger sends, and extend the platform to fit
            your unique needs.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">webhooks</h3>
          <p>
            get real-time notifications about subscriber activity. use webhooks
            to trigger custom actions in your own systems. react instantly to
            opens, clicks, bounces, and unsubscribes.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">self-hosting</h3>
          <p>
            want to run {meta.name} on your own infrastructure? you can. it's{" "}
            <b>completely open-source</b>, so you have full control, full
            transparency, and the freedom to deploy however you want.
          </p>
        </div>
      </div>
    </section>
  );
};
