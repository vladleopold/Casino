import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const releaseRoot = path.join(repoRoot, "release");

const rootFiles = [
  "README.md",
  "PRODUCT_BLUEPRINT.md",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "turbo.json"
];

function ensureDir(targetPath) {
  mkdirSync(targetPath, { recursive: true });
}

function resetDir(targetPath) {
  rmSync(targetPath, { recursive: true, force: true });
  ensureDir(targetPath);
}

function copyEntry(relativePath, targetBase) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(targetBase, relativePath);

  ensureDir(path.dirname(targetPath));
  cpSync(sourcePath, targetPath, {
    recursive: true,
    filter: (itemPath) => {
      const relative = path.relative(repoRoot, itemPath);

      if (!relative || relative === ".") {
        return true;
      }

      const parts = relative.split(path.sep);

      if (
        parts.includes("node_modules") ||
        parts.includes(".next") ||
        parts.includes(".turbo") ||
        parts.includes("dist") ||
        parts.includes("release") ||
        parts.includes("Temp") ||
        relative.endsWith(".tsbuildinfo") ||
        relative.endsWith(".log") ||
        relative.endsWith(".DS_Store")
      ) {
        return false;
      }

      return true;
    }
  });
}

function writeBundleReadme(bundlePath, title, lines) {
  const content = [`# ${title}`, "", ...lines, ""].join("\n");
  writeFileSync(path.join(bundlePath, "README.md"), content, "utf8");
}

function createBundle(bundleName, entries, readmeTitle, readmeLines) {
  const bundlePath = path.join(releaseRoot, bundleName);

  resetDir(bundlePath);

  for (const file of rootFiles) {
    copyEntry(file, bundlePath);
  }

  for (const entry of entries) {
    copyEntry(entry, bundlePath);
  }

  writeBundleReadme(bundlePath, readmeTitle, readmeLines);
}

function createReleaseReadme() {
  const content = [
    "# Release Bundles",
    "",
    "This folder contains deployable package layouts for the current SlotCity platform.",
    "",
    "Bundles:",
    "",
    "- `slotcity-platform-monorepo`: full repo snapshot for Git-based deployment.",
    "- `slotcity-web-vercel`: minimal workspace for Vercel frontend deployment.",
    "- `slotcity-render-backend`: minimal workspace for Directus and events on Render.",
    "- `slotcity-cloudflare-worker`: Worker-only package for Cloudflare deploy.",
    "",
    "Control screenshots:",
    "",
    "- `../Temp/slotcity-web-home-check-v32.png`",
    "- `../Temp/slotcity-catalog-check-v11.png`",
    "- `../Temp/slotcity-live-check-v8.png`",
    ""
  ].join("\n");

  writeFileSync(path.join(releaseRoot, "README.md"), content, "utf8");
}

function writeUploadInstructions() {
  const content = [
    "# Upload Instructions",
    "",
    "Default archive:",
    "",
    "- `slotcity-deployment-bundle.zip`",
    "",
    "Inside the bundle:",
    "",
    "- `slotcity-platform-monorepo.zip` — full repository snapshot for Git-based deployment",
    "- `slotcity-web-vercel.zip` — frontend package for Vercel",
    "- `slotcity-render-backend.zip` — Directus and events package for Render",
    "- `slotcity-cloudflare-worker.zip` — Cloudflare Worker package",
    "",
    "Quick handoff order:",
    "",
    "1. Upload `slotcity-web-vercel.zip` to the frontend team or connect it to Vercel.",
    "2. Upload `slotcity-render-backend.zip` to the backend team or use it for Render services.",
    "3. Upload `slotcity-cloudflare-worker.zip` for the public edge worker.",
    "4. Keep `slotcity-platform-monorepo.zip` as the full backup and source-of-truth package.",
    "",
    "Integrity check:",
    "",
    "```bash",
    "cd /Volumes/Work/Casino/release",
    "LC_ALL=C LANG=C shasum -a 256 -c CHECKSUMS.sha256",
    "```",
    ""
  ].join("\n");

  writeFileSync(path.join(releaseRoot, "UPLOAD_INSTRUCTIONS.md"), content, "utf8");
}

function createArchive(archiveName, entries) {
  const archivePath = path.join(releaseRoot, archiveName);
  rmSync(archivePath, { force: true });

  execFileSync("zip", ["-qr", archiveName, ...entries], {
    cwd: releaseRoot,
    stdio: "inherit"
  });
}

function createSha256(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

function timestampLabel(date = new Date()) {
  const iso = date.toISOString().replace(/[-:]/g, "");
  const [day, time] = iso.split("T");
  return `${day.slice(0, 8)}-${time.slice(0, 6)}`;
}

function writeChecksums(files) {
  const lines = files.map((file) => {
    const digest = createSha256(path.join(releaseRoot, file));
    return `${digest}  ${file}`;
  });

  writeFileSync(path.join(releaseRoot, "CHECKSUMS.sha256"), `${lines.join("\n")}\n`, "utf8");
}

resetDir(releaseRoot);

createBundle(
  "slotcity-platform-monorepo",
  ["apps", "packages", "deploy", "infra", ".github"],
  "SlotCity Platform Monorepo",
  [
    "Use this bundle when you want the full repository layout for Git-based deployment.",
    "",
    "Targets:",
    "",
    "- Vercel for `apps/web`",
    "- Render for `apps/directus` and `apps/events`",
    "- Cloudflare Worker for `deploy/cloudflare`",
    "",
    "Primary references:",
    "",
    "- `deploy/PRODUCTION_CHECKLIST.md`",
    "- `deploy/ENV_REFERENCE.md`",
    "- `deploy/SECRETS_CHECKLIST.md`",
    "- `deploy/LAUNCH_DAY_RUNBOOK.md`"
  ]
);

createBundle(
  "slotcity-web-vercel",
  ["apps/web", "packages", "deploy/vercel", "infra/scripts/check-route-budgets.mjs"],
  "SlotCity Web Bundle",
  [
    "Use this bundle for the frontend deployment on Vercel.",
    "",
    "Vercel settings:",
    "",
    "- Framework preset: `Next.js`",
    "- Root Directory: `apps/web`",
    "- Install Command: `corepack pnpm install --frozen-lockfile`",
    "- Build Command: `corepack pnpm --filter web build`",
    "",
    "Environment template:",
    "",
    "- `deploy/vercel/env.production.example`"
  ]
);

createBundle(
  "slotcity-render-backend",
  [
    "apps/directus",
    "apps/events",
    "packages/analytics-schema",
    "packages/cms-sdk",
    "packages/types",
    "deploy/render"
  ],
  "SlotCity Render Backend Bundle",
  [
    "Use this bundle for Render services.",
    "",
    "Services:",
    "",
    "- `slotcity-directus`",
    "- `slotcity-events`",
    "",
    "Primary files:",
    "",
    "- `deploy/render/render.yaml`",
    "- `deploy/render/env.shared.example`",
    "- `apps/directus/seed/route-payloads.json`"
  ]
);

createBundle(
  "slotcity-cloudflare-worker",
  ["deploy/cloudflare"],
  "SlotCity Cloudflare Worker Bundle",
  [
    "Use this bundle for the public edge Worker.",
    "",
    "Primary files:",
    "",
    "- `deploy/cloudflare/wrangler.jsonc`",
    "- `deploy/cloudflare/vars.production.example`",
    "- `deploy/cloudflare/src/index.ts`"
  ]
);

createReleaseReadme();

const manifest = {
  generatedAt: new Date().toISOString(),
  bundles: [
    "slotcity-platform-monorepo",
    "slotcity-web-vercel",
    "slotcity-render-backend",
    "slotcity-cloudflare-worker"
  ]
};

writeFileSync(
  path.join(releaseRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

writeUploadInstructions();

const bundleArchives = manifest.bundles.map((bundleName) => `${bundleName}.zip`);

for (const bundleName of manifest.bundles) {
  createArchive(`${bundleName}.zip`, [bundleName]);
}

const deploymentBundleEntries = [
  "README.md",
  "UPLOAD_INSTRUCTIONS.md",
  "manifest.json",
  ...bundleArchives
];
const timestampedDeploymentBundle = `slotcity-deployment-bundle-${timestampLabel()}.zip`;

createArchive("slotcity-deployment-bundle.zip", deploymentBundleEntries);
createArchive(timestampedDeploymentBundle, deploymentBundleEntries);

writeChecksums([
  ...bundleArchives,
  "slotcity-deployment-bundle.zip",
  timestampedDeploymentBundle
]);

console.log(`Release bundles created at ${releaseRoot}`);
