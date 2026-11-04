// Renderiza as páginas de inglês em PNG. uso: node render.mjs <dirPDFs> <dirSaida> [escala]
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [dir, out, scale = '2'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const f of readdirSync(dir).filter(f => f.includes('_PV_'))) {
  const id = f.replace('_PV_', '_').replace('_D1_CD1.pdf', '');
  const doc = await getDocument({ data: new Uint8Array(readFileSync(join(dir, f))), isEvalSupported: false, verbosity: 0 }).promise;
  for (const p of [2, 3]) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: +scale });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    writeFileSync(join(out, `${id}_p${p}.png`), canvas.toBuffer('image/png'));
    console.log(id, p, canvas.width, canvas.height);
  }
}
