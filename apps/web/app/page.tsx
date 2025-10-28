"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const [value, setValue] = useState("go");

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Shadcn in turborepo :)</h1>
        <Button size="sm" onClick={() => toast.info("You clicked me :)")}>
          Click me
        </Button>
        <ModeToggle />
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Best Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="ts">Typescript</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
