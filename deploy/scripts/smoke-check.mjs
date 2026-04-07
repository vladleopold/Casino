const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
const edgeHealthUrl = process.env.EDGE_HEALTH_URL;
const directusHealthUrl = process.env.DIRECTUS_HEALTH_URL;
const eventsHealthUrl = process.env.EVENTS_HEALTH_URL;

if (!siteUrl) {
  console.error("SITE_URL is required.");
  process.exit(1);
}

const checks = [
  { label: "home", url: `${siteUrl}/` },
  { label: "catalog", url: `${siteUrl}/catalog` },
  { label: "live", url: `${siteUrl}/live` }
];

if (edgeHealthUrl) {
  checks.push({ label: "edge health", url: edgeHealthUrl });
}

if (directusHealthUrl) {
  checks.push({ label: "directus health", url: directusHealthUrl });
}

if (eventsHealthUrl) {
  checks.push({ label: "events health", url: eventsHealthUrl });
}

let hasFailure = false;

for (const check of checks) {
  try {
    const response = await fetch(check.url, {
      redirect: "follow",
      headers: {
        "user-agent": "slotcity-smoke-check/1.0"
      }
    });

    if (!response.ok) {
      hasFailure = true;
      console.error(`FAIL ${check.label}: ${response.status} ${check.url}`);
      continue;
    }

    console.log(`OK   ${check.label}: ${response.status} ${check.url}`);
  } catch (error) {
    hasFailure = true;
    console.error(`FAIL ${check.label}: ${check.url}`);
    console.error(error instanceof Error ? error.message : String(error));
  }
}

if (hasFailure) {
  process.exit(1);
}
