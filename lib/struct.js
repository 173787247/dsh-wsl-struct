import { spawn } from "node:child_process";
import { existsSync, realpathSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((resolvePromise) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => resolvePromise(c === 0 ? out.trim() : ""));
  });
}

function defaultRoots() {
  const home = homedir();
  return [home, resolve(home, ".dsh"), "/tmp"].filter((p) => existsSync(p));
}

export function assertSafePath(filePath, allowRoots = []) {
  const abs = resolve(String(filePath || "").trim());
  if (!abs || abs.includes("\0")) throw new Error("invalid path");
  const real = existsSync(abs) ? realpathSync(abs) : abs;
  const roots = (allowRoots.length ? allowRoots : defaultRoots()).map((r) => {
    const a = resolve(r);
    return existsSync(a) ? realpathSync(a) : a;
  });
  const ok = roots.some((root) => {
    const r = root.replace(/[/\\]+$/, "");
    return real === r || real.startsWith(r + "/") || real.startsWith(r + "\\");
  });
  if (!ok) throw new Error(`path outside allowRoots: ${real}`);
  return real;
}

export function run(bin, args, { timeoutMs = 15_000, input } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    if (input != null) {
      child.stdin.write(String(input));
      child.stdin.end();
    } else {
      child.stdin.end();
    }
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > 500_000) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({ code, stdout, stderr });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function structStatus() {
  return {
    ok: true,
    jq: (await which("jq")) || null,
    yq: (await which("yq")) || null,
    sqlite3: (await which("sqlite3")) || null,
  };
}

export async function runJq({ filter, path, input, allowRoots, timeoutMs, maxOut = 80_000 }) {
  const f = String(filter || ".").trim();
  if (!f || f.length > 2000) throw new Error("invalid jq filter");
  const bin = (await which("jq")) || "jq";
  let args = ["-c", f];
  let stdin;
  if (path) {
    const file = assertSafePath(path, allowRoots);
    args.push(file);
  } else {
    stdin = String(input || "");
    if (!stdin) throw new Error("jq: path or input required");
  }
  const { code, stdout, stderr } = await run(bin, args, { timeoutMs, input: stdin });
  if (code !== 0) throw new Error(`jq failed: ${stderr || code}`);
  const out = stdout.slice(0, maxOut);
  return { ok: true, chars: out.length, truncated: stdout.length > maxOut, output: out };
}

export async function runYq({ expression, path, allowRoots, timeoutMs, maxOut = 80_000 }) {
  const expr = String(expression || ".").trim();
  if (!expr || expr.length > 2000) throw new Error("invalid yq expression");
  const file = assertSafePath(path, allowRoots);
  const bin = (await which("yq")) || "yq";
  const { code, stdout, stderr } = await run(bin, [expr, file], { timeoutMs });
  if (code !== 0) throw new Error(`yq failed: ${stderr || code}`);
  const out = stdout.slice(0, maxOut);
  return { ok: true, path: file, chars: out.length, truncated: stdout.length > maxOut, output: out };
}

/** Read-only sqlite: only allow SELECT / WITH / PRAGMA table_info. */
export function assertReadonlySql(sql) {
  const s = String(sql || "").trim();
  if (!s || s.length > 4000) throw new Error("invalid sql");
  if (s.includes(";")) throw new Error("sql: multiple statements refused");
  const head = s.replace(/^\s*\(/, "").trim().toUpperCase();
  if (!(head.startsWith("SELECT") || head.startsWith("WITH") || head.startsWith("PRAGMA TABLE_INFO"))) {
    throw new Error("sqlite: only SELECT / WITH / PRAGMA table_info allowed");
  }
  if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|ATTACH|DETACH|VACUUM|REPLACE|CREATE|GRANT)\b/i.test(s)) {
    throw new Error("sqlite: mutating keywords refused");
  }
  return s;
}

export async function runSqlite({ db, sql, allowRoots, timeoutMs, maxOut = 80_000 }) {
  const file = assertSafePath(db, allowRoots);
  const q = assertReadonlySql(sql);
  const bin = (await which("sqlite3")) || "sqlite3";
  const { code, stdout, stderr } = await run(bin, ["-readonly", "-json", file, q], { timeoutMs });
  if (code !== 0) throw new Error(`sqlite3 failed: ${stderr || code}`);
  const out = stdout.slice(0, maxOut);
  return { ok: true, db: file, chars: out.length, truncated: stdout.length > maxOut, output: out };
}
