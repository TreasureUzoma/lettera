export * from "@workspace/db/types";
export * from "@workspace/db";

export * from "@workspace/validations";

export * from "./auth";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type SubscriberStatus =
  | "subscribed"
  | "unsubscribed"
  | "pending"
  | "bounced";
