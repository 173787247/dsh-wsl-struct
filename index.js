import { structStatus, runJq, runYq, runSqlite } from "./lib/struct.js";

export const name = "dsh-wsl-struct";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-struct] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const allowRoots = Array.isArray(config.allowRoots) ? config.allowRoots.map(String) : [];
  console.log(`[dsh-wsl-struct] allowRoots=${allowRoots.length || "defaults"}`);

  ctx.systemPrompt.section({
    name: "tool:struct",
    order: 131,
    text: "dsh-wsl-struct runs sandboxed jq / yq / sqlite3 (SELECT-only) under allowlisted roots. Prefer these over raw bash for structured config and local SQLite caches. Never use for destructive SQL.",
  });

  ctx.tools.register({
    name: "struct_status",
    description: "Whether jq / yq / sqlite3 are on PATH.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v) }] },
    timeoutMs: 5_000,
    isConcurrencySafe: () => true,
    async execute() {
      return structStatus();
    },
    presentCall: () => ({ card: "generic", title: "struct status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "struct status", content: r.content }),
  });

  ctx.tools.register({
    name: "struct_jq",
    description: "Run jq filter on a file under allowRoots, or on inline JSON input.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["filter"],
      properties: {
        filter: { type: "string" },
        path: { type: "string" },
        input: { type: "string", description: "Inline JSON when path omitted" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await runJq({ ...args, allowRoots, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "jq" }),
    presentResult: (_a, r) => ({ card: "generic", title: "jq", content: r.content }),
  });

  ctx.tools.register({
    name: "struct_yq",
    description: "Run yq expression on a YAML/JSON file under allowRoots.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["expression", "path"],
      properties: { expression: { type: "string" }, path: { type: "string" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await runYq({ ...args, allowRoots, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "yq" }),
    presentResult: (_a, r) => ({ card: "generic", title: "yq", content: r.content }),
  });

  ctx.tools.register({
    name: "struct_sqlite",
    description: "Read-only sqlite3 query (SELECT / WITH / PRAGMA table_info only) against a DB under allowRoots.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["db", "sql"],
      properties: { db: { type: "string" }, sql: { type: "string" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.output }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await runSqlite({ ...args, allowRoots, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "sqlite" }),
    presentResult: (_a, r) => ({ card: "generic", title: "sqlite", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
