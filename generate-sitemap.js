import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

const links = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about" },
  { url: "/contact" },
];

const sitemap = new SitemapStream({
  hostname: "https://apsco.site"
});

const writeStream = createWriteStream("./public/sitemap.xml");

links.forEach(link => sitemap.write(link));
sitemap.end();

streamToPromise(sitemap).then(sm => writeStream.write(sm));
