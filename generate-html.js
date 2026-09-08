import fs from "node:fs";
import path from "node:path";

async function generate() {
  try {
    const serverModule = await import("./dist/server/index.js");
    const handler = serverModule.default;
    const req = new Request("http://localhost/");
    const res = await handler.fetch(req, {}, {});
    if (res.status === 200) {
      const html = await res.text();
      const outPath = path.resolve("./dist/client/index.html");
      fs.writeFileSync(outPath, html, "utf-8");
      console.log("✓ Successfully generated dist/client/index.html for Netlify / Static CDN hosting!");
    } else {
      console.error("Failed to render index.html, status:", res.status);
      process.exit(1);
    }
  } catch (err) {
    console.error("Error generating index.html:", err);
    process.exit(1);
  }
}

generate();
