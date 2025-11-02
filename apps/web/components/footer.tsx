import { meta } from "@workspace/constants/meta";
import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

const footerSections = [
  {
    title: "product",
    links: [
      { name: "overview", url: "/" },
      { name: "pricing", url: "/pricing" },
      { name: "docs", url: "/docs" },
    ],
  },
  {
    title: "company",
    links: [
      { name: "about", url: "/about" },
      { name: "blog", url: "/blog" },
      { name: "contact", url: "/contact" },
    ],
  },
  {
    title: "developers",
    links: [
      { name: "github", url: meta.socials.github },
      { name: "status", url: "/status" },
      { name: "changelog", url: "/changelog" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="w-full border-t mt-36">
      <div className="max-w-5xl mx-auto p-6 md:py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <h3 className="font-bold text-lg">{meta.name}</h3>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            built for developers who value speed, openness, and simplicity.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="font-semibold text-base">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="hover:underline hover:text-muted-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-xs md:text-sm py-4 px-6 flex items-center justify-between max-w-5xl mx-auto">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} {meta.name}. mit licensed.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            href={meta.developer.url}
            className="underline hover:text-muted-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            developer
          </Link>
          <div className="scale-80">
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};
