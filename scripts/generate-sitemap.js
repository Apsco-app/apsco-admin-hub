import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream, existsSync, mkdirSync } from "fs";

const links = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/contact", changefreq: "monthly", priority: 0.6 },
];

// Ensure public/ exists
if (!existsSync("public")) {
  mkdirSync("public");
}

async function generateSitemap() {
  const sitemap = new SitemapStream({
    hostname: "https://apsco.site",
  });

  const writeStream = createWriteStream("public/sitemap.xml");
  sitemap.pipe(writeStream);

  links.forEach(link => sitemap.write(link));
  sitemap.end();

  await streamToPromise(sitemap);
  console.log("✅ Sitemap generated at public/sitemap.xml");
}

generateSitemap();
