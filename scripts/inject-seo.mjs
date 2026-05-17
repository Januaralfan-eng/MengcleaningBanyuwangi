import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "dist", "public");
const SITE_URL = process.env.SITE_PUBLIC_URL || "https://mengcleaning-banyuwangi.vercel.app";

const TITLE = "Meng-Cleaning Banyuwangi — Home Services Banyuwangi: Pembersihan, Perbaikan & Perawatan Rumah";
const DESCRIPTION = "Home Services Banyuwangi terpercaya: pembersihan rumah, perbaikan listrik, kran & saluran air, plafon & interior. Pesan online cepat untuk area Banyuwangi & sekitarnya.";
const KEYWORDS = [
  "Home Services Banyuwangi",
  "jasa pembersihan Banyuwangi",
  "cleaning service Banyuwangi",
  "jasa perbaikan rumah Banyuwangi",
  "perawatan rumah Banyuwangi",
  "Meng-Cleaning Banyuwangi",
  "tukang Banyuwangi",
  "jasa listrik Banyuwangi",
  "jasa pipa Banyuwangi",
  "jasa plafon Banyuwangi"
].join(", ");
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const SEO_BLOCK_START = "<!-- seo-inject:start -->";
const SEO_BLOCK_END = "<!-- seo-inject:end -->";

function buildSeoBlock() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: "Meng-Cleaning Banyuwangi",
    alternateName: "Meng-Cleaning",
    description: DESCRIPTION,
    url: SITE_URL,
    telephone: "+6285755211349",
    email: "kardiman.official@gmail.com",
    image: OG_IMAGE,
    priceRange: "Rp 100.000 - Rp 350.000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Banyuwangi",
      addressRegion: "Jawa Timur",
      addressCountry: "ID"
    },
    areaServed: {
      "@type": "City",
      name: "Banyuwangi"
    },
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home Services Banyuwangi",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Layanan Pembersihan" }, price: "100000", priceCurrency: "IDR" },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Perbaikan Listrik" }, price: "150000", priceCurrency: "IDR" },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Perbaikan Kran & Saluran Air" }, price: "150000", priceCurrency: "IDR" },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Perbaikan Plafon & Interior" }, price: "350000", priceCurrency: "IDR" }
      ]
    }
  };

  return [
    SEO_BLOCK_START,
    `    <meta name="description" content="${DESCRIPTION}" />`,
    `    <meta name="keywords" content="${KEYWORDS}" />`,
    `    <meta name="robots" content="index, follow, max-image-preview:large" />`,
    `    <meta name="googlebot" content="index, follow" />`,
    `    <meta name="author" content="Meng-Cleaning Banyuwangi" />`,
    `    <meta name="geo.region" content="ID-JI" />`,
    `    <meta name="geo.placename" content="Banyuwangi" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:site_name" content="Meng-Cleaning Banyuwangi" />`,
    `    <meta property="og:title" content="${TITLE}" />`,
    `    <meta property="og:description" content="${DESCRIPTION}" />`,
    `    <meta property="og:url" content="${SITE_URL}" />`,
    `    <meta property="og:image" content="${OG_IMAGE}" />`,
    `    <meta property="og:locale" content="id_ID" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${TITLE}" />`,
    `    <meta name="twitter:description" content="${DESCRIPTION}" />`,
    `    <meta name="twitter:image" content="${OG_IMAGE}" />`,
    `    <link rel="canonical" href="${SITE_URL}/" />`,
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    SEO_BLOCK_END
  ].join("\n");
}

function applyToHtml(html) {
  let out = html;
  const existingBlock = new RegExp(`${SEO_BLOCK_START}[\\s\\S]*?${SEO_BLOCK_END}`);
  if (existingBlock.test(out)) {
    out = out.replace(existingBlock, buildSeoBlock());
  } else if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${buildSeoBlock()}\n  </head>`);
  } else {
    out = `${buildSeoBlock()}\n${out}`;
  }
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${TITLE}</title>`);
  if (!/<title>/i.test(out) && /<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `<title>${TITLE}</title>\n  </head>`);
  }
  out = out.replace(/<html(\s[^>]*)?>/i, (match, attrs = "") => {
    if (/\blang=/i.test(attrs)) return match;
    return `<html lang="id"${attrs}>`;
  });
  return out;
}

async function writeRobots() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ""
  ].join("\n");
  await fs.writeFile(path.join(OUT_DIR, "robots.txt"), body, "utf-8");
}

async function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["/", "/services", "/pricing", "/portfolio", "/blog", "/faq", "/booking"];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE_URL}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u === "/" ? "1.0" : "0.7"}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;
  await fs.writeFile(path.join(OUT_DIR, "sitemap.xml"), body, "utf-8");
}

async function main() {
  const indexPath = path.join(OUT_DIR, "index.html");
  try {
    const html = await fs.readFile(indexPath, "utf-8");
    await fs.writeFile(indexPath, applyToHtml(html), "utf-8");
    await writeRobots();
    await writeSitemap();
    console.log("SEO inject selesai: meta tags + robots.txt + sitemap.xml.");
  } catch (error) {
    console.warn(`SEO inject dilewati: ${error.message}`);
  }
}

main();
