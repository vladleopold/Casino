import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const manifestPath = path.join(repoRoot, "apps", "web", ".next", "app-build-manifest.json");
const budgetsPath = path.join(repoRoot, "infra", "ci", "route-budgets.json");
const nextRoot = path.join(repoRoot, "apps", "web", ".next");

if (!fs.existsSync(manifestPath)) {
  console.error("Missing Next build manifest. Run `corepack pnpm --filter web build` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const budgets = JSON.parse(fs.readFileSync(budgetsPath, "utf8"));

let hasError = false;

for (const [route, maxBytes] of Object.entries(budgets)) {
  const files = manifest.pages?.[route];

  if (!files) {
    console.error(`Route ${route} is missing from app-build-manifest.json.`);
    hasError = true;
    continue;
  }

  const totalBytes = files
    .filter((file) => file.endsWith(".js"))
    .reduce((sum, file) => {
      const assetPath = path.join(nextRoot, file);
      const source = fs.readFileSync(assetPath);
      return sum + zlib.gzipSync(source).byteLength;
    }, 0);

  if (totalBytes > maxBytes) {
    console.error(
      `${route} exceeds budget: ${(totalBytes / 1000).toFixed(1)} kB > ${(Number(maxBytes) / 1000).toFixed(1)} kB`
    );
    hasError = true;
    continue;
  }

  console.log(
    `${route} within budget: ${(totalBytes / 1000).toFixed(1)} kB / ${(Number(maxBytes) / 1000).toFixed(1)} kB`
  );
}

if (hasError) {
  process.exit(1);
}
