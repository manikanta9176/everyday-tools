import type { CategoryId } from "@/lib/categories";

export type ToolPriority = "P0" | "P1" | "P2";
export type ToolStatus = "ready";

export type ToolDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  tags: string[];
  aliases: string[];
  keywords: string[];
  priority: ToolPriority;
  status: ToolStatus;
  supportsLocalProcessing: true;
  featured?: boolean;
  quickAction?: boolean;
  related: string[];
  examples?: string[];
  limitations?: string[];
};

export type ToolIconName =
  | "key"
  | "lock"
  | "fingerprint"
  | "hash"
  | "binary"
  | "braces"
  | "file"
  | "palette"
  | "image"
  | "type"
  | "code"
  | "clock"
  | "ruler"
  | "globe"
  | "fileText"
  | "qr"
  | "diff";
