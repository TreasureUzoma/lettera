"use client";

import { useGetProfile, useUpdateProfile } from "@/hooks/use-auth";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@workspace/validations";
import { Loader2, User, Mail, Shield, Bell } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";

export default function SettingsPage() {
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: profile?.name || "",
      username: profile?.username || "",
    },
  });

  const onSubmit = (values: any) => {
    updateProfile(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 bg-muted"
          >
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground cursor-not-allowed"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground cursor-not-allowed"
          >
            <Shield className="w-4 h-4" />
            Security
          </Button>
        </aside>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile and how people see you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your unique URL identifier.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        value={profile?.email}
                        disabled
                        className="opacity-70 bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled
                      >
                        Verified
                      </Button>
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Email cannot be changed currently.
                    </p>
                  </div>
                  <Button type="submit" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
