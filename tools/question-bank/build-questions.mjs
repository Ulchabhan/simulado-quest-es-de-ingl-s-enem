// Gera www/data/questions.js e as figuras, validando cada questão.
// uso: node build-questions.mjs <bank-data> <www>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { EXAMS, ITEMS, OLDER } from './questions-src.mjs';

const [dataDir, www] = process.argv.slice(2);
const keys = JSON.parse(readFileSync(join(dataDir, 'keys.json'), 'utf8'));
const raw = readFileSync(join(dataDir, 'raw.txt'), 'utf8');
mkdirSync(join(www, 'data'), { recursive: true });

const NOISE = /(LC\s*[-•–]|–LC|CADERNO 1|APLICA[CÇ]|aplica[cç][aã]o|^\d+$|^[–-]$|ENEM ?20|P[aá]gina \d|LINGUAGENS, C|Quest[oõ]es de 01|\bDIA\b|^\*\d+AZ|^\[\[ESPANHOL)/;
const SRC = /Dispon[ií]vel em|Acesso em|^[A-ZÀ-Ú'-]{2,}(?:,| )\s?[A-Z]\.|Demco Media|Houston:|San Francisco:|Martian Chronicles/;

function examRows(name) {
  const m = raw.split(/\n#{5,} /).find(s => s.startsWith(name + ' '));
  const qs = {};
  let cur = null;
  for (const line of m.split('\n')) {
    const r = line.match(/^\s*(\d+)\s+(\d+)\s(.*)$/);
    if (!r) continue;
    const [, , x, text] = r;
    if (NOISE.test(text)) continue;
    const q = text.match(/^QUEST[ÃAã]O\s*0?([1-5])$/i);
    if (q) { cur = q[1]; qs[cur] = []; continue; }
    if (cur) qs[cur].push({ x: +x, text });
  }
  return qs;
}

function parse(rows, addE) {
  rows = rows.slice();
  if (addE) rows.push({ x: 289, text: addE });
  const idx = {};
  let need = 4;
  for (let i = rows.length - 1; i >= 0 && need >= 0; i--) {
    const L = 'ABCDE'[need];
    if (new RegExp(`^${L}{1,2}\\s`).test(rows[i].text)) { idx[L] = i; need--; }
  }
  if (need >= 0) throw new Error('alternativas incompletas');
  const clean = s => s.replace(/^[A-E]{1,2}\s+/, '');
  const alts = 'ABCDE'.split('').map((L, k) => {
    const end = k < 4 ? idx['ABCDE'[k + 1]] : rows.length;
    return clean(rows.slice(idx[L], end).map(r => r.text).join(' ')).trim();
  });
  const head = rows.slice(0, idx.A);
  const srcIdx = head.map((r, i) => SRC.test(r.text) ? i : -1).filter(i => i >= 0);
  let body, src, stem;
  if (srcIdx.length) {
    const a = srcIdx[0], b = srcIdx[srcIdx.length - 1];
    body = head.slice(0, a);
    src = head.slice(a, b + 1).map(r => r.text).join(' ');
    stem = head.slice(b + 1).map(r => r.text).join(' ');
  } else {
    body = head.slice(0, -1);
    src = '';
    stem = head[head.length - 1].text;
  }
  return { body, src, stem, alts };
}

function reflow(body, it) {
  let rows = body.slice(it.dropRows || 0);
  if (it.title) rows = rows.filter(r => r.text.replace(/\s+/g, ' ') !== it.title);
  if (it.poem) {
    const out = [];
    for (const r of rows) {
      if (r.text.startsWith('[') && !/^\[(…|\.\.\.)\]/.test(r.text)) {
        out[out.length - 1] += ' ' + r.text.slice(1);
      } else out.push(r.text);
    }
    if (it.stanzas) for (const n of [...it.stanzas].reverse()) out.splice(n, 0, '');
    return out.join('\n');
  }
  const base = Math.min(...rows.map(r => r.x));
  const paras = [];
  for (const r of rows) {
    if (!paras.length || r.x > base + 8) paras.push(r.text);
    else paras[paras.length - 1] += ' ' + r.text;
  }
  return paras.join('\n');
}

const crop = async (file, box, out) => {
  const img = await loadImage(readFileSync(file));
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  const c = createCanvas(w, h);
  c.getContext('2d').drawImage(img, x0, y0, w, h, 0, 0, w, h);
  writeFileSync(join(www, 'img', out), c.toBuffer('image/jpeg', 80));
};

const Q = [], errors = [];
for (const it of ITEMS) {
  const [ex, n] = it.id.split('-');
  const exam = EXAMS[ex];
  const a = keys[exam]?.[n];
  const year = ex.replace('ppl', '');
  let p = { src: '', stem: '', alts: null, body: [] };
  try {
    if (!it.alts) p = parse(examRows(exam)[n], it.addE);
  } catch (e) { errors.push(`${it.id}: ${e.message}`); continue; }
  let text = it.text ?? reflow(p.body, it);
  for (const [f, t] of it.fixText || []) text = text.replaceAll(f, t);
  const q = {
    id: it.id, y: (ex.startsWith('ppl') ? 'PPL ' : '') + year, a, off: 1,
    tec: it.tec, g: it.g, title: it.title || undefined, poem: it.poem ? 1 : undefined,
    text, src: it.src || p.src, stem: it.stem || p.stem, alts: it.alts || p.alts,
    tip: it.tip, why: it.why, clue: it.clue,
  };
  if (it.fig) {
    const page = join(dataDir, 'pages', `${exam}_p${it.fig.p}.png`);
    q.fig = `${it.id}.jpg`;
    await crop(page, it.fig.box, q.fig);
  }
  Q.push(q);
}
for (const it of OLDER) {
  const q = { id: it.id, y: it.y, a: it.a, off: 0, tec: it.tec, g: it.g, title: it.title, poem: it.poem ? 1 : undefined, text: it.text, src: it.src, stem: it.stem, alts: it.alts, tip: it.tip, why: it.why, clue: it.clue };
  if (it.oldImg) {
    q.fig = `${it.id}.jpg`;
    await crop(join(dataDir, 'legacy', it.oldImg.file), it.oldImg.box, q.fig);
  }
  Q.push(q);
}

// validação
const norm = s => s.replace(/\s+/g, ' ');
for (const q of Q) {
  const tag = q.id;
  if (!/^[A-E]$/.test(q.a || '')) errors.push(`${tag}: sem gabarito`);
  if (!q.stem || q.stem.length < 10) errors.push(`${tag}: enunciado suspeito: "${q.stem}"`);
  if (!q.alts || q.alts.length !== 5 || q.alts.some(a => !a || a.length < 3)) errors.push(`${tag}: alternativas: ${JSON.stringify(q.alts)}`);
  if (!q.src) errors.push(`${tag}: sem fonte`);
  if (!q.text && !q.fig) errors.push(`${tag}: sem texto`);
  if (q.clue && !norm(q.text).includes(norm(q.clue))) errors.push(`${tag}: pista fora do texto: "${q.clue}"`);
  if (/[�]/.test(q.text + q.stem)) errors.push(`${tag}: caractere inválido`);
}
const ids = new Set(Q.map(q => q.id));
if (ids.size !== Q.length) errors.push('ids repetidos');

writeFileSync(join(www, 'data', 'questions.js'), 'window.QUESTIONS=' + JSON.stringify(Q) + ';\n');
writeFileSync(join(dataDir, 'questions.json'), JSON.stringify(Q, null, 1));

const count = {};
for (const q of Q) count[q.tec] = (count[q.tec] || 0) + 1;
console.log('questoes', Q.length, count, 'com figura', Q.filter(q => q.fig).length);
console.log(errors.length ? 'ERROS:\n' + errors.join('\n') : 'SEM ERROS');
for (const q of Q.filter(q => !q.fig)) console.log(`\n[${q.id}] ${q.a} | ${q.title || ''}\nFONTE: ${q.src}\nENUNC: ${q.stem}\nTEXTO: ${q.text.slice(0, 90).replace(/\n/g, ' / ')}…`);
process.exit(errors.length ? 1 : 0);
