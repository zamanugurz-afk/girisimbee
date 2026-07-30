import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const self = fileURLToPath(import.meta.url);

if (!process.env.TEST_SCRAPERS_TSX) {
  const result = spawnSync("npx", ["tsx", self], {
    stdio: "inherit",
    cwd: root,
    shell: true,
    env: { ...process.env, TEST_SCRAPERS_TSX: "1" },
  });
  process.exit(result.status ?? 1);
}

const LIMIT = 20;

function readIfExists(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function summarize(provider, listings, extra = "") {
  const suffix = extra ? ` (${extra})` : "";
  console.log(`\n=== ${provider}${suffix} ===`);
  console.log(`count: ${listings.length}`);
  if (listings[0]) {
    console.log("example:", listings[0].url ?? listings[0].slug ?? JSON.stringify(listings[0]).slice(0, 120));
    console.log("sample:", JSON.stringify(listings[0], null, 2));
  } else {
    console.log("example: (none)");
  }
}

async function main() {
  const dolapHtml =
    readIfExists("tmp-dolap.html") ??
    readIfExists("tmp-dolap-live.html") ??
    readIfExists("tmp-dolap-curl.html");
  if (dolapHtml) {
    const { parseDolapSearchHtml } = await import(
      pathToFileURL(path.join(root, "services/providers/dolap-scraper.ts")).href
    );
    summarize("dolap", parseDolapSearchHtml(dolapHtml, LIMIT));
  } else {
    console.log("\n=== dolap (skipped ? no tmp-dolap*.html) ===");
  }

  const { parseLetgoSearchHtml } = await import(
    pathToFileURL(path.join(root, "services/providers/letgo-scraper.ts")).href
  );
  const letgoFiles = [
    "tmp-letgo-fixture.html",
    "tmp-letgo-browser.html",
    "tmp-letgo-live.html",
    "tmp-letgo-curl.html",
    "tmp-letgo.html",
  ];
  let letgoTested = false;
  for (const rel of letgoFiles) {
    const letgoHtml = readIfExists(rel);
    if (!letgoHtml) continue;
    letgoTested = true;
    const listings = parseLetgoSearchHtml(letgoHtml, LIMIT);
    summarize("letgo", listings, rel);
    if (listings.length === 0 && /captcha|bot|blocked|access denied|bm-verify|interstitial/i.test(letgoHtml)) {
      console.log("note: HTML looks like a bot block page");
    }
  }
  if (!letgoTested) {
    console.log("\n=== letgo (skipped - no tmp-letgo*.html) ===");
  }

  const { parseSahibindenSearchHtml } = await import(
    pathToFileURL(path.join(root, "services/providers/sahibinden-scraper.ts")).href
  );
  const sahHtml = readIfExists("tmp-sah-live.html");
  if (sahHtml) {
    summarize("sahibinden", parseSahibindenSearchHtml(sahHtml, LIMIT));
  } else {
    console.log("\n=== sahibinden (missing tmp-sah-live.html) ===");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
