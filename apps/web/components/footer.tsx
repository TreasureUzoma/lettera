import { meta } from "@workspace/constants/meta";
import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

const footerLinks = [
  {
    title: "github",
    url: meta.socials.github,
  },
  {
    title: "developer",
    url: meta.developer.url,
  },
];

export const Footer = () => {
  return (
    <footer className="w-full max-w-3xl mx-auto p-4 md:py-5 text-sm border-t mt-36">
      <div className="flex items-center justify-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} MIT Licensed</p>
        <div className="flex items-center space-x-4 md:space-x-6">
          {footerLinks.map((link) => (
            <Link
              className="underline hover:text-muted-foreground"
              href={link.url}
              key={link.title}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.title}
            </Link>
          ))}
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};
