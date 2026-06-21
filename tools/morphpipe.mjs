// De-risk the cross-font morph pipeline in THIS environment (no guessing):
// woff2 -> ttf (wawoff2) -> opentype.js parse -> glyph path -> polymorph interpolate.
import opentype from 'opentype.js';
import wawoff2 from 'wawoff2';
import polymorph from 'polymorph-js';
import fs from 'node:fs';

const toAB = b => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
async function load(p){ const ttf = await wawoff2.decompress(fs.readFileSync(p)); return opentype.parse(toAB(Buffer.from(ttf))); }

const A = await load('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2');
const B = await load('node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2');

const dA = A.charToGlyph('e').getPath(0, 0, 300).toPathData(2);
const dB = B.charToGlyph('e').getPath(0, 0, 300).toPathData(2);
console.log('font A names:', A.names.fontFamily && A.names.fontFamily.en);
console.log('font B names:', B.names.fontFamily && B.names.fontFamily.en);
console.log('glyph "e" path  A:', dA.length, 'chars   B:', dB.length, 'chars');

const interp = polymorph.interpolate([dA, dB], { addPoints: 1, optimize: 'fill', precision: 1 });
const mid = interp(0.5);
console.log('morph(0.5) path:', mid.length, 'chars');
console.log(mid.startsWith('M') ? 'OK — pipeline works ✅' : '⚠️ unexpected path');
