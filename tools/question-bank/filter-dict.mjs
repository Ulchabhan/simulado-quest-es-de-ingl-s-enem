// Reduz o dump do Kaikki às palavras das provas (e às palavras-base delas).
// uso: node filter-dict.mjs <english.jsonl> <questions.json> <filtered.jsonl>
import { createReadStream, createWriteStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const [dump, qfile, out] = process.argv.slice(2);
const Q = JSON.parse(readFileSync(qfile, 'utf8'));
const TOKEN = /[A-Za-zÀ-ÿ]+(?:[’'-][A-Za-zÀ-ÿ]+)*/g;
const need = new Set();
for (const q of Q) {
  for (const raw of `${q.title || ''} ${q.text}`.match(TOKEN) || []) {
    const w = raw.replace(/’/g, "'").replace(/'s$/i, '');
    for (const v of [w, w.toLowerCase(), w[0].toUpperCase() + w.slice(1).toLowerCase()]) need.add(v);
    for (const part of w.split('-')) if (part.length > 1) { need.add(part); need.add(part.toLowerCase()); }
  }
}
// locuções do glossário próprio não dependem do dump
console.log('palavras procuradas', need.size);

async function pass(set, ws) {
  const lemmas = new Set();
  let kept = 0;
  const rl = createInterface({ input: createReadStream(dump), crlfDelay: Infinity });
  for await (const line of rl) {
    // Leitura completa: "word" também aparece dentro de forms/translations.
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    if (e.lang_code !== 'en' || !set.has(e.word)) continue;
    const isPt = t => t.code === 'pt' || t.lang_code === 'pt' || t.lang === 'Portuguese';
    const slim = {
      word: e.word, pos: e.pos,
      senses: (e.senses || []).slice(0, 12).map(s => ({
        glosses: s.glosses, tags: s.tags, form_of: s.form_of, alt_of: s.alt_of,
        examples: (s.examples || []).slice(0, 8).map(x => x.text).filter(Boolean),
        pt: (s.translations || []).filter(isPt).map(t => t.word),
      })),
      pt: (e.translations || []).filter(isPt).map(t => ({ w: t.word, s: t.sense })),
    };
    ws.write(JSON.stringify(slim) + '\n');
    kept++;
    for (const s of slim.senses) for (const f of [...(s.form_of || []), ...(s.alt_of || [])]) if (f.word) lemmas.add(f.word);
  }
  return { kept, lemmas };
}

const ws = createWriteStream(out);
const first = await pass(need, ws);
const second = new Set([...first.lemmas].filter(w => !need.has(w)));
console.log('passo 1', first.kept, 'novas palavras-base', second.size);
const b = await pass(second, ws);
console.log('passo 2', b.kept);
ws.end();
