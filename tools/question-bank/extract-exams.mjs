// Extrai a parte de inglês (Q1-5) de cada prova e o gabarito oficial.
// uso: node extract-exams.mjs <dirPDFs> <saida.txt> <keys.json>
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [dir, outTxt, outKeys] = process.argv.slice(2);
const open = f => getDocument({ data: new Uint8Array(readFileSync(join(dir, f))), isEvalSupported: false, verbosity: 0 }).promise;

async function rows(page, x0, x1) {
  const { items } = await page.getTextContent();
  const by = new Map();
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const x = it.transform[4], y = Math.round(it.transform[5]);
    if (x < x0 || x >= x1) continue;
    let k = [...by.keys()].find(v => Math.abs(v - y) <= 2);
    if (k === undefined) { k = y; by.set(k, []); }
    by.get(k).push({ x, s: it.str, w: it.width });
  }
  return [...by.keys()].sort((a, b) => b - a).map(y => {
    const parts = by.get(y).sort((a, b) => a.x - b.x);
    let line = '', end = null;
    for (const p of parts) {
      if (end !== null && p.x - end > 1.2 && !line.endsWith(' ') && !p.s.startsWith(' ')) line += ' ';
      line += p.s; end = p.x + p.w;
    }
    return { y, x: Math.round(parts[0].x), text: line.replace(/\s+/g, ' ').trim() };
  });
}

async function images(page) {
  const ops = await page.getOperatorList();
  let n = 0;
  for (const f of ops.fnArray) if (f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject) n++;
  return n;
}

const keys = {};
let out = '';
const files = readdirSync(dir).filter(f => f.endsWith('.pdf')).sort();
for (const f of files.filter(f => f.includes('_GB_'))) {
  const doc = await open(f);
  const page = await doc.getPage(1);
  const m = page.getViewport({ scale: 1 }).width;
  const r = await rows(page, 0, m);
  const k = {};
  for (const row of r) {
    const g = row.text.match(/^([1-5])\s+([A-E])\s+([A-E])\b/);
    if (g) k[g[1]] = g[2];
  }
  // tabela em colunas separadas: 'r' pode juntar com a outra coluna
  for (const row of r) {
    const g = row.text.match(/(?:^|\s)([1-5])\s+([A-E])\s+([A-E])(?:\s|$)/);
    if (g && !k[g[1]]) k[g[1]] = g[2];
  }
  const id = f.replace('_GB_', '_').replace('_D1_CD1.pdf', '');
  keys[id] = k;
  console.log(id, JSON.stringify(k));
}
writeFileSync(outKeys, JSON.stringify(keys, null, 1));

for (const f of files.filter(f => f.includes('_PV_'))) {
  const id = f.replace('_PV_', '_').replace('_D1_CD1.pdf', '');
  const doc = await open(f);
  out += `\n\n################ ${id} (${doc.numPages} pp)\n`;
  let stop = false;
  for (let p = 2; p <= 6 && !stop; p++) {
    const page = await doc.getPage(p);
    const { width } = page.getViewport({ scale: 1 });
    const imgs = await images(page);
    out += `\n=== pagina ${p} imagens=${imgs}\n`;
    for (const [name, a, b] of [['ESQ', 0, width / 2], ['DIR', width / 2, width + 1]]) {
      out += `--- coluna ${name}\n`;
      for (const row of await rows(page, a, b)) {
        if (/op[cç][aã]o:?\s*espanhol/i.test(row.text)) { stop = true; out += '[[ESPANHOL]]\n'; break; }
        if (/^(ENEM \d{4} ){3}/.test(row.text) || /^\*\d+AZ\d+\*$/.test(row.text)) continue;
        out += `${String(row.y).padStart(4)} ${String(row.x).padStart(4)} ${row.text}\n`;
      }
      if (stop) break;
    }
  }
}
writeFileSync(outTxt, out);
console.log('ok', outTxt, out.length);
