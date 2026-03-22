/**
 * Rename the linked Netlify site (subdomain *.netlify.app).
 * Usage: npm run netlify:rename -- my-new-name
 */
const { readFileSync, existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const newName = process.argv[2];

if (!newName || !/^[a-z0-9-]{1,63}$/.test(newName)) {
  console.error("Usage: npm run netlify:rename -- <subdomain-name>");
  console.error("Lowercase letters, numbers, and hyphens only (max 63).");
  process.exit(1);
}

let siteId = process.env.NETLIFY_SITE_ID;
const statePath = path.join(root, ".netlify", "state.json");
if (!siteId && existsSync(statePath)) {
  siteId = JSON.parse(readFileSync(statePath, "utf8")).siteId;
}
if (!siteId) {
  console.error("No site ID found. Deploy once from this folder or set NETLIFY_SITE_ID.");
  process.exit(1);
}

const payload = JSON.stringify({ siteId, body: { name: newName } });
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const r = spawnSync(npx, ["netlify", "api", "updateSite", "--data", payload], {
  cwd: root,
  stdio: "inherit",
});
process.exit(r.status === 0 ? 0 : 1);
