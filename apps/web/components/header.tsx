import Link from "next/link";
import React from "react";
import { meta } from "@workspace/constants/meta";

const navLinks = [
  {
    title: "log in",
    url: "/login",
  },
  {
    title: "blog",
    url: "/blog",
  },
  {
    title: "pricing",
    url: "/#pricing",
  },
];

export const Header = () => {
  return (
    <nav className="p-4 md:p-5.5 flex items-center justify-center fixed w-full">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div>
          <Link href="/" className="font-bold">
            {meta.name}
          </Link>
        </div>
        <div className="flex items-center justify-center gap-x-4 font-medium">
          {navLinks.map((link) => (
            <Link key={link.title} className="hover:underline" href={link.url}>
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
