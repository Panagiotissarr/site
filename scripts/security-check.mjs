// Lightweight, dependency-free regression checks for the security config.
// Run: npm run security:check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

let pass = 0, fail = 0;
const check = (condition, label) => {
  if (condition) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); }
};

const cfg = JSON.parse(read("vercel.json"));
const block = cfg.headers.find((h) => h.source === "/(.*)");
const headers = Object.fromEntries((block?.headers || []).map((h) => [h.key, h.value]));
const csp = headers["Content-Security-Policy"] || "";
const hsts = (headers["Strict-Transport-Security"] || "").toLowerCase();

console.log("=== Response headers ===");
for (const name of [
  "Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options",
  "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy", "Strict-Transport-Security",
]) check(!!headers[name], `${name} present`);
check(hsts.includes("max-age=63072000") && hsts.includes("includesubdomains"), "HSTS: max-age=63072000; includeSubDomains");
check(!hsts.includes("preload"), "HSTS preload not enabled");
check((JSON.stringify(cfg.headers).match(/Strict-Transport-Security/gi) || []).length === 1, "exactly one HSTS header");
check(!(headers["Permissions-Policy"] || "").includes("*"), "Permissions-Policy has no wildcard");
check(!(headers["Cross-Origin-Embedder-Policy"]), "COEP not enabled");

console.log("\n=== CSP ===");
check(!csp.includes("unsafe-eval"), "no unsafe-eval");
check(!/(^|[\s'"])https?:\/\/\*([\s;'"]|$)/.test(csp), "no scheme-wide wildcard source");
check(!/(^|\s)https:(\s|;|$)/.test(csp), "img-src not widened to https:");
check(!csp.includes("unsplash"), "no unused Unsplash sources");
check(!csp.includes("cdnjs"), "no unused cdnjs sources");
const styleSrc = csp.split(";").map((s) => s.trim()).find((s) => s.startsWith("style-src")) || "";
check(styleSrc.includes("'unsafe-inline'"), "style-src keeps the required 'unsafe-inline'");

console.log("\n=== Metadata & static files ===");
const indexHtml = read("index.html");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const securityTxt = read("public/.well-known/security.txt");
check(indexHtml.includes('rel="canonical" href="https://sarris.dev/"'), "canonical URL");
check(indexHtml.includes('property="og:url" content="https://sarris.dev/"'), "og:url");
check(indexHtml.includes('content="https://sarris.dev/assets/img/web-preview.png"'), "social preview URL");
check(indexHtml.includes("@its_sarris"), "X handle @its_sarris");
check(!indexHtml.includes("old.sarris.dev") && !indexHtml.includes("Panagiotis0615"), "no stale metadata values");
for (const dead of ["./css/style.css", "no-cursor.css", "contact-widget.css", "font.otf", "cdnjs.cloudflare.com"]) {
  check(!indexHtml.includes(dead), `dead reference removed: ${dead}`);
}
check(securityTxt.includes("mailto:mail@sarris.dev") && securityTxt.includes("Expires:"), "security.txt contact + Expires");
check(robots.includes("Sitemap: https://sarris.dev/sitemap.xml") && /Disallow:\s*\/debug/.test(robots), "robots.txt canonical sitemap + /debug disallow");
check(!sitemap.includes("old.sarris.dev") && sitemap.includes("https://sarris.dev/"), "sitemap.xml canonical domain");

console.log("\n=== Source safety ===");
const files = [];
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).forEach((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walk(p);
  else if (/\.(ts|tsx|js|html|json)$/.test(e.name)) files.push(p);
});
walk("src"); walk("api"); walk("lib"); walk("public");
files.push("index.html", "vercel.json");
const secretRe = /sk-[A-Za-z0-9]{12,}|(?:api[_-]?key|token|secret|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']|AKIA[0-9A-Z]{16}/;
const unsafeRe = /\beval\s*\(|\bnew Function\s*\(|dangerouslySetInnerHTML|document\.write\s*\(|\.innerHTML\s*=/;
let secretHits = 0, unsafeHits = 0;
for (const file of files) {
  read(file).split(/\r?\n/).forEach((line) => {
    if (secretRe.test(line)) { secretHits++; console.log(`    secret? ${file}: ${line.trim().slice(0, 80)}`); }
    if (unsafeRe.test(line)) { unsafeHits++; console.log(`    unsafe  ${file}: ${line.trim().slice(0, 80)}`); }
  });
}
check(secretHits === 0, "no hardcoded secrets in source");
check(unsafeHits === 0, "no eval / new Function / innerHTML / dangerous HTML injection");

console.log(`\n=== SUMMARY: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
