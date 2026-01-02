import { meta } from "@workspace/constants/meta";

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: meta.name,
    },
  };
}
