export function withBase(path = "/"): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return base.endsWith("/") ? base : `${base}/`;
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${prefix}${normalized}`;
}
