# Lettera

It's an opensource alternative to buttondown.

That's all

## Adding shadcn components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Todos

Add a themes table, for users to save styles i guess

Add an activity log table

Add a paid type for projects

tansactional emails for creating users etc

i'll also have to rethink payment flows for subs and users

POST /emails → create draft

PATCH /emails/:id → update draft

POST /emails/:id/send → send now

GET /emails → list project’s emails

(optional) POST /emails/:id/schedule → schedule send

---

endpoint to update emaill/password
