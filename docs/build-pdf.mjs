// Builds docs/<milestone>/build/team-050-<milestone>.pdf from the numbered
// Markdown files (01-*.md, 02-*.md, ...) in that milestone folder, using
// headless Chrome or Edge to print the rendered HTML.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';

const TEAM = '050';
const here = dirname(fileURLToPath(import.meta.url));
const milestone = process.argv[2] ?? 'milestone-1';
const srcDir = join(here, milestone);
const outDir = join(srcDir, 'build');

const parts = readdirSync(srcDir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
if (parts.length === 0) {
  console.error(`No numbered Markdown files found in ${srcDir}`);
  process.exit(1);
}

const body = parts
  .map((f) => marked.parse(readFileSync(join(srcDir, f), 'utf8')))
  .join('\n')
  // Keep IDs such as US-01, P-02 and PS-3 from breaking at the hyphen.
  .replace(/\b((?:US|PS|P|T|W)-\d{1,2})\b/g, '<span class="id">$1</span>');
const css = readFileSync(join(here, 'pdf.css'), 'utf8');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Team ${TEAM} — ${milestone}</title>
<style>${css}</style></head>
<body>${body}</body></html>`;

mkdirSync(outDir, { recursive: true });
const htmlPath = join(outDir, `team-${TEAM}-${milestone}.html`);
const pdfPath = join(outDir, `team-${TEAM}-${milestone}.pdf`);
writeFileSync(htmlPath, html);

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const browser = browsers.find((p) => existsSync(p));
if (!browser) {
  console.error(`Chrome/Edge not found. Set CHROME_PATH, or print ${htmlPath} to PDF manually.`);
  process.exit(1);
}

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  pathToFileURL(htmlPath).href,
], { stdio: 'inherit' });

console.log(`Built ${pdfPath} from ${parts.join(', ')}`);
