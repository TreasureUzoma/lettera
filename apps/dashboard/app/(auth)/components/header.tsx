import Link from "next/link";
import React from "react";
import { meta } from "@workspace/constants/meta";

export const AuthHeader = () => {
  return (
    <nav className="p-4 md:p-5.5 flex items-center justify-center fixed w-full">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div>
          <Link href="/" className="font-bold">
            {meta.name}
          </Link>
        </div>
      </div>
    </nav>
  );
};
