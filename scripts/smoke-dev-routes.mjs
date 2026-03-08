#!/usr/bin/env node
import { spawn } from "node:child_process";

const DEFAULT_ROUTES = ["/", "/docs", "/about"];
const port = Number(process.env.SMOKE_PORT || 3100);
const host = process.env.SMOKE_HOST || "127.0.0.1";
const startupTimeoutMs = Number(process.env.SMOKE_START_TIMEOUT_MS || 45_000);
const routeTimeoutMs = Number(process.env.SMOKE_ROUTE_TIMEOUT_MS || 12_000);

const argRoutesIdx = process.argv.indexOf("--routes");
const rawRoutesArg = argRoutesIdx >= 0 ? process.argv[argRoutesIdx + 1] : undefined;
const rawRoutesEnv = process.env.ROUTES;
const rawRoutes = rawRoutesArg || rawRoutesEnv;
const routes = rawRoutes
  ? rawRoutes.split(",").map((r) => r.trim()).filter(Boolean)
  : DEFAULT_ROUTES;

if (routes.length === 0) {
  console.error("[smoke] no routes provided");
  process.exit(1);
}

const dev = spawn("pnpm", ["run", "dev", "--hostname", host, "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

let ready = false;
let startupTimer;

function shutdown(code) {
  if (!dev.killed) dev.kill("SIGTERM");
  clearTimeout(startupTimer);
  process.exit(code);
}

function markReadyFrom(text) {
  if (/Ready in|started server on|Local:\s+http/i.test(text)) ready = true;
}

dev.stdout.on("data", (buf) => {
  const text = buf.toString();
  process.stdout.write(text);
  markReadyFrom(text);
});

dev.stderr.on("data", (buf) => {
  const text = buf.toString();
  process.stderr.write(text);
  markReadyFrom(text);
});

dev.on("exit", (code) => {
  if (!ready) {
    console.error(`[smoke] dev server exited before ready (code ${code ?? "null"})`);
    process.exit(1);
  }
});

startupTimer = setTimeout(() => {
  if (!ready) {
    console.error(`[smoke] timed out waiting for dev server readiness after ${startupTimeoutMs}ms`);
    shutdown(1);
  }
}, startupTimeoutMs);

async function waitUntilReady() {
  const started = Date.now();
  while (!ready) {
    if (Date.now() - started > startupTimeoutMs) throw new Error("startup timeout");
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function checkRoute(route) {
  const url = `http://${host}:${port}${route}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), routeTimeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    if (res.status >= 500) {
      throw new Error(`route ${route} returned ${res.status}`);
    }
    console.log(`[smoke] ${route} -> ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  try {
    await waitUntilReady();
    for (const route of routes) {
      await checkRoute(route);
    }
    shutdown(0);
  } catch (err) {
    console.error(`[smoke] failed: ${(err && err.message) || err}`);
    shutdown(1);
  }
})();
