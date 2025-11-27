import { Card } from "@workspace/ui/components/card";
import { UsernameForm } from "./components/username-form";

export default function UsernamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-7">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set your username
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            You need a username to create projects.
          </p>
        </div>

        <UsernameForm />
      </Card>
    </div>
  );
}
