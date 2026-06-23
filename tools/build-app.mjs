/* tools/build-app.mjs — produce a SELF-CONTAINED app/index.html from app/app.src.html
 * by inlining engine/engine.mjs + engine/dom-renderer.mjs into one classic <script>.
 *
 * Why: ES-module imports are blocked over file:// in real browsers (CORS), so a
 * module-based page renders blank when opened by double-click or inside DaVinci's
 * CEF. Inlining makes one file that just works — offline, file://, and in-Resolve.
 *
 * Source of truth stays engine/*.mjs and app/app.src.html. Run after editing either:
 *   node tools/build-app.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = p => readFileSync(resolve(root, p), "utf8");

// strip ESM keywords so the code runs as a plain classic script
const strip = code => code
  .replace(/^[ \t]*import\b.*$/gm, "")        // drop `import … from …`
  .replace(/^([ \t]*)export\s+default\s+/gm, "$1") // (safety) export default X → X
  .replace(/^([ \t]*)export\s+/gm, "$1");     // export const/function → const/function

const vendor   = read("app/vendor/animation-timeline.min.js");
const engine   = strip(read("engine/engine.mjs"));
const renderer = strip(read("engine/dom-renderer.mjs"));
const canvasR  = strip(read("engine/canvas-renderer.mjs"));
const inlined =
  `/* ====== vendored: animation-timeline-js v2.3.5 (MIT) — bundled for offline/self-contained use ====== */\n` +
  vendor + "\n" +
  `/* ====== inlined engine — DO NOT EDIT HERE; edit engine/*.mjs then run tools/build-app.mjs ====== */\n` +
  engine + "\n" + renderer + "\n" + canvasR +
  `\n/* ====== app ====== */`;

let html = read("app/app.src.html");
if (!html.includes('<script type="module">')) {
  throw new Error('app.src.html: expected a <script type="module"> block');
}
html = html
  .replace('<script type="module">', "<script>\n" + inlined)  // engine first, classic script
  .replace(/^[ \t]*import\b.*$/gm, "");                        // remove the app's own import lines

writeFileSync(resolve(root, "app/index.html"), html);

// sanity: no ESM keywords must remain
const leftover = (html.match(/^[ \t]*(import|export)\b.*$/gm) || []);
if (leftover.length) { console.error("WARNING leftover ESM lines:\n" + leftover.join("\n")); process.exit(1); }
console.log(`built app/index.html — self-contained, ${html.length} bytes, no ESM imports ✓`);
