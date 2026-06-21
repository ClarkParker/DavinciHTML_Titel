// Build: inline the @fontsource variable fonts as base64 into the prototype.
// Run from the tools/ dir:  node build.mjs
import fs from 'node:fs';

const FONTS = [
  // family,                         woff2 path (relative to tools/),                                               weight-range
  ['Bricolage Grotesque Variable', 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2', '200 800'],
  ['Archivo Variable',             'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',                          '100 900'],
];

let face = '';
for (const [family, file, range] of FONTS) {
  const b64 = fs.readFileSync(file).toString('base64');
  face += `@font-face{font-family:'${family}';font-style:normal;font-weight:${range};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2')}\n`;
}

const src = fs.readFileSync('../prototype/index.src.html', 'utf8');
if (!src.includes('/*FONTS*/')) { console.error('placeholder /*FONTS*/ not found in src'); process.exit(1); }
const out = src.replace('/*FONTS*/', face);
fs.writeFileSync('../prototype/index.html', out);
console.log('built ../prototype/index.html', Math.round(out.length / 1024) + 'kb', '· fonts inlined:', FONTS.length);
