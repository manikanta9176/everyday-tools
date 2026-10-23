import type { ToolDefinition } from "@/lib/tool-types";

function haystack(tool: ToolDefinition) {
  return [tool.name, tool.description, tool.category, ...tool.aliases, ...tool.keywords, ...tool.tags]
    .join(" ")
    .toLowerCase();
}

export function searchTools(tools: ToolDefinition[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tools;
  const tokens = normalized.split(/\s+/).filter(Boolean);

  return tools
    .map((tool) => {
      const name = tool.name.toLowerCase();
      const text = haystack(tool);
      let score = 0;
      if (name === normalized) score += 120;
      if (tool.aliases.some((alias) => alias.toLowerCase() === normalized)) score += 110;
      if (tool.keywords.some((keyword) => keyword.toLowerCase() === normalized)) score += 100;
      if (name.includes(normalized)) score += 40;
      if (text.includes(normalized)) score += 20;
      for (const token of tokens) {
        if (!text.includes(token)) return { tool, score: 0 };
        score += 8;
        if (name.includes(token)) score += 6;
      }
      return { tool, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((item) => item.tool);
}
