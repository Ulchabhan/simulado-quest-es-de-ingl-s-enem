// Gera www/data/dict.js: D = verbetes, F = forma -> palavra-base, P = locuções.
// uso: node build-dict.mjs <filtered.jsonl> <questions.json> <www>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PHRASES, WORDS, IGNORE } from './glossary.mjs';
import { VERBS, conjugate, kinds } from './verbs.mjs';

const [filtered, qfile, www] = process.argv.slice(2);
const POS = { noun: 'substantivo', verb: 'verbo', adj: 'adjetivo', adv: 'advérbio', prep: 'preposição', conj: 'conjunção', pron: 'pronome', det: 'determinante', article: 'artigo', intj: 'interjeição', num: 'numeral', contraction: 'contração', particle: 'partícula', phrase: 'expressão', name: 'nome próprio' };
const RANK = ['verb', 'noun', 'adj', 'adv', 'prep', 'conj', 'pron', 'det', 'article', 'contraction', 'num', 'intj', 'particle', 'phrase', 'name'];
const BAD_TAG = new Set(['obsolete', 'archaic', 'dialectal', 'rare', 'nonstandard', 'misspelling', 'vulgar', 'offensive', 'derogatory', 'historical', 'error-lua-exec']);
const BAD_TEXT = /\b(thee|thou|thy|hath|doth|fuck|shit|cunt|nigg|whore)\b|\^|\{\{/i;
// Exemplos e definições vão para adolescentes: nada de conteúdo sexual explícito.
const ADULT = /\b(sex|sexual|penis|vagina|genital|erotic|porn|orgasm|masturbat|rape)\w*/i;
const RUDE = /\b(damn|hell|bastard|bitch|ass|arse|crap|piss|bloody|give a toss|kill yourself)\b/i;

const entries = new Map();
for (const line of readFileSync(filtered, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const e = JSON.parse(line);
  if (!POS[e.pos]) continue;
  if (!entries.has(e.word)) entries.set(e.word, []);
  entries.get(e.word).push(e);
}

const okSense = s => s.glosses?.length && !(s.tags || []).some(t => BAD_TAG.has(t)) && !ADULT.test(s.glosses.join(' '));
const isForm = s => s.form_of?.length || s.alt_of?.length;
const cleanDef = d => d.replace(/\s+/g, ' ').trim();

function senseFor(e) {
  const real = e.senses.filter(s => okSense(s) && !isForm(s));
  if (!real.length) return null;
  const t = [];
  const add = w => { if (w && !t.includes(w) && t.length < 5 && !/[{}]/.test(w)) t.push(w); };
  // traduções ligadas ao primeiro sentido vêm antes das demais
  for (const s of real) for (const w of s.pt || []) add(w);
  for (const x of e.pt || []) add(x.w);
  const g = real[0].glosses;
  const lastG = g[g.length - 1];
  const d = cleanDef(lastG.startsWith('...') ? g.join(' ') : lastG);
  const stem = e.word.toLowerCase().slice(0, Math.max(3, e.word.length - 2));
  const goodEx = x => x.length >= 15 && x.length <= 110 && !BAD_TEXT.test(x) && !RUDE.test(x) && !ADULT.test(x)
    && /^[A-Z“"]/.test(x) && /[.!?”"]$/.test(x) && !/(^|\s)['’][a-z]/.test(x)
    && !x.includes(' / ') && !/\b(?!teeth\b)[a-z]{3,}eth\b/.test(x) && !/\bwrit\b/.test(x)
    && /^[\x20-\x7E’‘“”—–…]+$/.test(x) && x.toLowerCase().includes(stem);
  let ex;
  for (const s of real) {
    ex = (s.examples || []).find(goodEx);
    if (ex) break;
  }
  return { p: POS[e.pos], t, d: d.length > 220 ? d.slice(0, 217) + '…' : d, e: ex, rank: RANK.indexOf(e.pos) };
}

function formOf(list) {
  for (const e of list) for (const s of e.senses) {
    if (!isForm(s) || (s.tags || []).some(t => BAD_TAG.has(t))) continue;
    const f = (s.form_of || s.alt_of || [])[0]?.word;
    if (f) return f;
  }
  return null;
}

function own(word) {
  const list = entries.get(word);
  if (!list) return [];
  const seen = new Set(), out = [];
  for (const e of list) {
    if (seen.has(e.pos)) continue;
    const s = senseFor(e);
    if (s) { seen.add(e.pos); out.push(s); }
  }
  // Mantém a ordem do Wiktionary (o uso principal costuma vir antes); sem tradução e nome próprio descem.
  const score = s => (s.p === 'nome próprio' ? 2 : 0) + (s.t.length ? 0 : 1);
  return out.map((s, i) => ({ s, i })).sort((a, b) => score(a.s) - score(b.s) || a.i - b.i).slice(0, 2).map(({ s: { rank, ...r } }) => r);
}

const D = {}, F = {};
const TOKEN = /[A-Za-zÀ-ÿ]+(?:[’'-][A-Za-zÀ-ÿ]+)*/g;
const Q = JSON.parse(readFileSync(qfile, 'utf8'));
const freq = new Map();
for (const q of Q) for (const raw of `${q.title || ''} ${q.text}`.match(TOKEN) || []) {
  let w = raw.replace(/’/g, "'").replace(/'s$/i, '');
  const key = w === 'I' ? 'I' : w.toLowerCase();
  freq.set(key, (freq.get(key) || 0) + 1);
}

function resolve(tok) {
  const k = tok === 'I' ? 'i' : tok;
  if (D[k] || F[k]) return true;
  if (WORDS[k]) { D[k] = WORDS[k]; return true; }
  const candidates = tok === 'I' ? ['I'] : [tok, tok[0].toUpperCase() + tok.slice(1)];
  for (const c of candidates) {
    const lemma = formOf(entries.get(c) || []);
    const mine = own(c);
    const lemmaS = lemma && lemma !== c ? (WORDS[lemma] || own(lemma)) : [];
    if (lemmaS.length && !mine.some(s => s.t.length && s.p !== 'nome próprio')) {
      if (!D[lemma]) D[lemma] = lemmaS;
      F[k] = lemma;
      return true;
    }
    if (mine.length) {
      // Forma que também é palavra: só acrescenta a palavra-base se ela tiver tradução.
      D[k] = lemmaS[0]?.t?.length ? [mine[0], lemmaS[0]] : mine;
      return true;
    }
    if (lemmaS.length) { D[lemma] ||= lemmaS; F[k] = lemma; return true; }
  }
  return false;
}

// Plurais e flexões regulares que o dump não cobre.
function rule(tok) {
  const c = [];
  if (tok.endsWith('ies')) c.push(tok.slice(0, -3) + 'y');
  if (tok.endsWith('es')) c.push(tok.slice(0, -2));
  if (tok.endsWith('s')) c.push(tok.slice(0, -1));
  if (tok.endsWith('ied')) c.push(tok.slice(0, -3) + 'y');
  if (tok.endsWith('ed')) c.push(tok.slice(0, -2), tok.slice(0, -1));
  if (tok.endsWith('ing')) c.push(tok.slice(0, -3), tok.slice(0, -3) + 'e');
  for (const x of c) if (WORDS[x] || own(x).length) { D[x] ||= WORDS[x] || own(x); F[tok] = x; return true; }
  return false;
}

const missing = [], noPt = [];
for (const [tok, n] of [...freq.entries()].sort((a, b) => b[1] - a[1])) {
  if (IGNORE.has(tok)) continue;
  if (resolve(tok) || rule(tok)) continue;
  if (tok.includes('-') && tok.split('-').every(p => p.length < 2 || resolve(p.toLowerCase()) || rule(p.toLowerCase()))) continue;
  missing.push(`${tok}(${n})`);
}
// Verbos: a tabela revisada corrige a tradução do infinitivo e gera as formas flexionadas.
const V = {};
const uncovered = new Map();
for (const [base, infs] of Object.entries(VERBS)) {
  if (WORDS[base]) continue;
  if (!D[base]) { const o = own(base); if (o.length) D[base] = o; else if (![...freq.keys()].some(t => t === base)) continue; else D[base] = []; }
  const verb = D[base].find(s => s.p === 'verbo');
  if (verb) { verb.t = infs; D[base] = [verb, ...D[base].filter(s => s !== verb)]; }
  else D[base] = [{ p: 'verbo', t: infs }, ...D[base]].slice(0, 2);
}
for (const tok of freq.keys()) {
  if (tok.includes("'")) continue;
  const key = tok === 'I' ? 'i' : tok;
  for (const e of entries.get(tok) || []) {
    if (e.pos !== 'verb') continue;
    for (const s of e.senses) {
      if ((s.tags || []).some(t => BAD_TAG.has(t))) continue;
      // O Wiktionary às vezes traz a base com lixo ("choose and"): fica a primeira palavra.
      const rawBase = s.form_of?.[0]?.word;
      const base = rawBase && (VERBS[rawBase] ? rawBase : rawBase.split(' ')[0]);
      const infs = base && base !== tok && VERBS[base];
      if (!infs) { if (rawBase && rawBase !== tok) uncovered.set(tok, rawBase); continue; }
      const gloss = (s.glosses || []).join(' ');
      const conj = infs.map(conjugate);
      const row = V[key] ||= { l: base, f: {} };
      if (row.l !== base) continue; // várias palavras-base: fica a primeira do Wiktionary
      for (const k of kinds(gloss)) row.f[k] = conj.map(c => c[k]);
    }
  }
  if (V[key] && !Object.keys(V[key].f).length) delete V[key];
}
for (const [k, v] of Object.entries(PHRASES)) D[k] = v;
for (const [k, v] of Object.entries(D)) if (!v.some(s => s.t?.length)) noPt.push(k);
const P = Object.keys(PHRASES);

const js = 'window.DICT=' + JSON.stringify({ D, F, P, V }) + ';\n';
console.log('FORMAS VERBAIS', Object.keys(V).length);
for (const w of ['heard', 'said', 'made', 'went', 'told', 'seen', 'known', 'living', 'speaks', 'polishing', 'chose', 'left', 'found', 'bought', 'put', 'married', 'became', 'gave', 'rings']) console.log(w, JSON.stringify(V[w]));
console.log('FORMAS SEM QUADRO:', [...uncovered].filter(([t]) => !V[t]).map(([t, b]) => `${t}>${b}`).join(' '));
writeFileSync(join(www, 'data', 'dict.js'), js);
const total = [...freq.keys()].filter(k => !IGNORE.has(k)).length;
console.log({ tokensUnicos: total, verbetes: Object.keys(D).length, formas: Object.keys(F).length, locucoes: P.length, kb: Math.round(js.length / 1024), semVerbete: missing.length, semTraducaoPT: noPt.length, comExemplo: Object.values(D).filter(v => v.some(s => s.e)).length });
console.log('SEM VERBETE:', missing.join(' '));
console.log('SEM TRADUCAO PT:', noPt.join(' '));
for (const w of ['fault', 'blame', 'tosses', 'children', 'unbearable', 'left', 'i', 'instead of', 'the']) console.log(w, '=>', JSON.stringify(D[w] || { F: F[w], D: D[F[w]] }));
