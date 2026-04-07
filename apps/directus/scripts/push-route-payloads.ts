import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface RoutePayloadRecord {
  slug: string;
  payload: unknown;
}

interface SeedFile {
  storefront_route_payloads: RoutePayloadRecord[];
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(currentDir, "../seed/route-payloads.json");
const directusUrl = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const directusToken = process.env.DIRECTUS_TOKEN;
const contentStatus = process.env.DIRECTUS_CONTENT_STATUS ?? "published";
const isDryRun =
  process.argv.includes("--dry-run") || process.env.DIRECTUS_DRY_RUN === "true";

const rawSeed = await readFile(seedPath, "utf8");
const seed = JSON.parse(rawSeed) as SeedFile;

if (isDryRun) {
  for (const entry of seed.storefront_route_payloads) {
    console.log(`[dry-run] would upsert ${entry.slug}`);
  }
  process.exit(0);
}

if (!directusUrl || !directusToken) {
  console.error("DIRECTUS_URL and DIRECTUS_TOKEN are required.");
  process.exit(1);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${directusUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${directusToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  return (await response.json()) as T;
}

for (const entry of seed.storefront_route_payloads) {
  const encodedSlug = encodeURIComponent(entry.slug);
  const existing = await request<{ data?: Array<{ id: string }> }>(
    `/items/storefront_route_payloads?filter[slug][_eq]=${encodedSlug}&fields=id`
  );

  if (existing.data?.[0]?.id) {
    await request<{ data?: { id: string } }>(
      `/items/storefront_route_payloads/${existing.data[0].id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          slug: entry.slug,
          payload: entry.payload,
          status: contentStatus
        })
      }
    );
    console.log(`updated ${entry.slug}`);
    continue;
  }

  await request<{ data?: { id: string } }>(`/items/storefront_route_payloads`, {
    method: "POST",
    body: JSON.stringify({
      slug: entry.slug,
      payload: entry.payload,
      status: contentStatus
    })
  });
  console.log(`created ${entry.slug}`);
}
