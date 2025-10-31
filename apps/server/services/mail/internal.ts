import type { ProjectRoles } from "@workspace/types";

// throw errors on error

export const sendWelcomeEmail = async (name: string, email: string) => {
  // todo: send email
};

export const sendForgottenPasswordEmail = async (
  email: string,
  expiresAt: Date,
  token: string
) => {
  // todo: send forgotten password email
};

export const sendProjectInviteEmail = async (
  teamName: string,
  role: ProjectRoles
) => {
  // todo: send project invite
};

export const sendUnsubscribeCofirmationEmail = async (
  email: string,
  projectName: string,
  confirmUrl: string
) => {
  //todo: send project unsubscribing confirmatiion
};
