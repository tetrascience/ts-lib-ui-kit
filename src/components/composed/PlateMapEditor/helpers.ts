import type { TemplateOption } from "./types";

export function groupTemplateOptions(templates: TemplateOption[] | undefined): [string, TemplateOption[]][] {
  const groups = new Map<string, TemplateOption[]>();
  (templates ?? []).forEach((template) => {
    const key = template.group ?? "";
    const list = groups.get(key) ?? [];
    list.push(template);
    groups.set(key, list);
  });
  return [...groups.entries()];
}
