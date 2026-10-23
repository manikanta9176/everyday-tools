import type { ComponentType } from "react";
import {
  Binary,
  Braces,
  Clock3,
  Code2,
  Diff,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  Palette,
  QrCode,
  Ruler,
  Type,
} from "lucide-react";
import type { ToolIconName } from "@/lib/tool-types";

const icons = {
  key: KeyRound,
  lock: LockKeyhole,
  fingerprint: Fingerprint,
  hash: Hash,
  binary: Binary,
  braces: Braces,
  file: FileText,
  palette: Palette,
  image: ImageIcon,
  type: Type,
  code: Code2,
  clock: Clock3,
  ruler: Ruler,
  globe: Globe,
  fileText: FileText,
  qr: QrCode,
  diff: Diff,
} satisfies Record<ToolIconName, ComponentType<{ className?: string }>>;

export function ToolIcon({ name, className }: { name: ToolIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
