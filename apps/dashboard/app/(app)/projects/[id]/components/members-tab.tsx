"use client";

import {
  useProjectMembers,
  useUpdateProjectMember,
} from "@/hooks/use-project-members";
import { useGetProfile } from "@/hooks/use-auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Loader2 } from "lucide-react";

export function MembersTab({ projectId }: { projectId: string }) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const { mutate: updateRole, isPending } = useUpdateProjectMember(projectId);
  const { data: user } = useGetProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          Manage who has access to this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {members?.map((member: any) => (
          <div
            key={member.userId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={`https://avatar.idolo.dev/${member.user.email}`}
                />
                <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
            </div>
            <Select
              defaultValue={member.role}
              onValueChange={(value) =>
                updateRole({ userId: member.userId, role: value })
              }
              disabled={isPending || member.email === user?.email}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
