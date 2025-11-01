import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateProfile } from "@workspace/validations";
import type { ServiceResponse } from "@workspace/types";

export const getProfileDataById = async (id: string) => {
  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!user) {
    return { data: null, success: false, message: "User not found." };
  }

  return {
    data: user,
    success: true,
    message: "Profile fetched successfully",
  };
};

export const getProfileDataByUsername = async (username: string) => {
  const [user] = await db
    .select({
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.username, username));

  if (!user) {
    return { data: null, success: false, message: "User not found." };
  }

  return {
    data: user,
    success: true,
    message: "Profile fetched successfully",
  };
};

export const updateUserProfile = async (
  userId: string,
  body: UpdateProfile
): Promise<ServiceResponse> => {
  try {
    const fieldsToUpdate: Partial<typeof users.$inferInsert> = {};

    if (body.name !== undefined) {
      fieldsToUpdate.name = body.name;
    }
    if (body.username !== undefined) {
      fieldsToUpdate.username = body.username;
    }
    if (body.avatarUrl !== undefined) {
      fieldsToUpdate.avatarUrl = body.avatarUrl;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return {
        data: null,
        success: false,
        message: "No fields provided for update.",
      };
    }

    const result = await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set(fieldsToUpdate)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          avatarUrl: users.avatarUrl,
        });

      if (!updatedUser) {
        tx.rollback();
        return null;
      }
      return updatedUser;
    });

    if (!result) {
      return {
        data: null,
        success: false,
        message: "User not found or update failed.",
      };
    }

    return {
      data: result,
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (err) {
    let errorMessage = "Something went wrong while updating the profile.";
    if (err instanceof Error) {
      if (
        err.message.includes("unique constraint") ||
        err.message.includes("duplicate key")
      ) {
        errorMessage = "A user with that username or email already exists.";
      } else {
        errorMessage = err.message;
      }
    }

    return {
      data: null,
      success: false,
      message: errorMessage,
    };
  }
};
