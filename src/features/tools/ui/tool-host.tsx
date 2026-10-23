"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { CategoryId } from "@/lib/categories";

const views = {
  secrets: dynamic(() => import("./secret-ui")),
  encoding: dynamic(() => import("./codec-ui")),
  data: dynamic(() => import("./data-ui")),
  color: dynamic(() => import("./color-ui")),
  image: dynamic(() => import("./image-ui")),
  text: dynamic(() => import("./text-ui")),
  code: dynamic(() => import("./code-ui")),
  time: dynamic(() => import("./time-ui")),
  math: dynamic(() => import("./math-ui")),
  web: dynamic(() => import("./web-ui")),
  documents: dynamic(() => import("./pdf-ui")),
  generators: dynamic(() => import("./generator-ui")),
} satisfies Record<CategoryId, ComponentType<{ slug: string }>>;

export function ToolWorkspace({ slug, category }: { slug: string; category: CategoryId }) {
  const View = views[category];
  return <View slug={slug} />;
}
