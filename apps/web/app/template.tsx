"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Analytics = dynamic(() => import("supametrics"), {
  ssr: false,
});

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Analytics
        url="supm_3451b50e5446a3f7d00c964a00ded61d"
        client="supm_cbc38e2f61b88a9f3d1f75d300595d14"
      />
    </div>
  );
}
