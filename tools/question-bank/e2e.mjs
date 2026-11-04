// Teste de ponta a ponta no Edge headless. uso: node e2e.mjs <index.html> <dirCapturas>
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const [html, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));

let fails = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`); if (!ok) fails++; };
const txt = sel => page.$eval(sel, e => e.innerText);
const click = sel => page.$eval(sel, e => e.click());

await page.goto(pathToFileURL(html).href);
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.reload();

const n = await page.evaluate(() => ALL.length);
check('banco com 60 questões', n === 60, String(n));
check('home mostra o total e os modos', (await txt('#app')).includes('60 questões') && (await txt('#app')).includes('Skimming'));
check('back() na home sai do app', (await page.evaluate(() => back())) === false);
await page.screenshot({ path: `${out}/1-home.png`, fullPage: true });

// Gabaritos conferidos à mão contra o PDF oficial do Inep lido nesta sessão.
const OFFICIAL = { '2024-2': 'A', '2025-2': 'D', '2023-2': 'B', '2023-3': 'D', '2022-1': 'D', '2021-1': 'C', '2024-4': 'A', '2020-5': 'C', '2025-4': 'E', 'ppl2024-5': 'B', 'ppl2021-5': 'C' };
for (const [id, a] of Object.entries(OFFICIAL)) {
  const got = await page.evaluate(i => ALL.find(q => q.id === i).a, id);
  if (got !== a) check(`gabarito ${id}`, false, `${got} != ${a}`);
}
check('gabaritos de referência conferem', true);

// Percorre as 60 no simulado completo, acertando tudo.
await page.evaluate(() => start());
const order = await page.evaluate(() => st.list.map(q => q.id));
check('simulado sem repetição', new Set(order).size === 60);
let noClue = [], badImg = [], overflow = [], stemMissing = [];
for (let i = 0; i < n; i++) {
  const info = await page.evaluate(async () => {
    const q = st.list[st.i], img = document.querySelector('.q img');
    if (img && !img.complete) await new Promise(r => { img.onload = img.onerror = r; });
    return { id: q.id, a: q.a, img: img ? img.naturalWidth : -1, hasClue: !!q.clue, wide: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  if (info.img === 0) badImg.push(info.id);
  if (info.wide) overflow.push(info.id);
  if ((await txt('.stem')).length < 10) stemMissing.push(info.id);
  await click(`#b${info.a}`);
  if (info.hasClue && !(await page.$('.clue'))) noClue.push(info.id);
  await page.evaluate(() => go(1));
}
check('todas as imagens carregam', badImg.length === 0, badImg.join(','));
check('sem rolagem horizontal', overflow.length === 0, overflow.join(','));
check('todos os enunciados aparecem', stemMissing.length === 0, stemMissing.join(','));
check('trecho-pista destacado após responder', noClue.length === 0, noClue.join(','));
check('resultado 60/60', (await txt('h1')) === '60/60');
check('resultado por técnica', (await txt('#app')).includes('Scanning: 23/23'));
await page.screenshot({ path: `${out}/5-resultado.png` });
await page.evaluate(() => home());
check('melhor nota salva', (await txt('#app')).includes('60/60'));

// Dicionário: abre uma questão específica no modo scanning.
const openQ = async id => page.evaluate(i => { st = { list: [ALL.find(q => q.id === i)], mode: null, i: 0, score: 0, ans: {}, t0: Date.now(), full: false, open: {} }; show(); }, id);
const tap = word => page.evaluate(w => { const el = [...document.querySelectorAll('.w')].find(x => x.textContent.toLowerCase() === w.toLowerCase()); if (!el) return false; el.click(); return true; }, word);
await openQ('2024-2');
await page.screenshot({ path: `${out}/2-questao.png`, fullPage: true });
check('locução “Instead of” é um único toque', await tap('Instead of'));
const sheet = await txt('#sheet');
check('locução mostra tradução, definição e exemplo', sheet.includes('em vez de') && sheet.includes('DEFINIÇÃO') && sheet.includes('EXEMPLO'), sheet.slice(0, 60).replace(/\n/g, ' '));
await page.screenshot({ path: `${out}/3-dicionario.png` });
check('back() fecha o dicionário primeiro', (await page.evaluate(() => back())) === true && !(await page.$('#sheet.open')));

await tap('polishing');
check('forma flexionada leva à palavra-base', (await txt('#sheet')).includes('polish'), (await txt('#sheet')).slice(0, 70).replace(/\n/g, ' '));
await page.evaluate(() => closeSheet());

// Cobertura real: toda palavra tocável de todas as questões.
const cov = await page.evaluate(() => {
  let total = 0, miss = new Map(), noPt = new Map();
  const box = document.createElement('div');
  for (const q of ALL) {
    box.innerHTML = tappable((q.title || '') + ' ' + q.text);
    for (const el of box.querySelectorAll('.w')) {
      total++;
      const r = lookup(el.textContent);
      const k = el.textContent.toLowerCase();
      if (!r) miss.set(k, (miss.get(k) || 0) + 1);
      else if (r.e && !r.e.some(s => s.t && s.t.length)) noPt.set(k, (noPt.get(k) || 0) + 1);
    }
  }
  const sum = m => [...m.values()].reduce((a, b) => a + b, 0);
  return { total, semVerbete: sum(miss), semTraducao: sum(noPt), listaSem: [...miss.keys()].join(' '), listaPt: [...noPt.keys()].join(' ') };
});
console.log('COBERTURA', JSON.stringify(cov));
check('ao menos 95% dos toques têm tradução', (cov.total - cov.semVerbete - cov.semTraducao) / cov.total >= 0.95, `${(100 * (cov.total - cov.semVerbete - cov.semTraducao) / cov.total).toFixed(1)}%`);

// Modo skimming escurece o miolo e o botão libera o texto.
await page.evaluate(() => start('skimming'));
check('skimming só tem questões da técnica', (await page.evaluate(() => st.list.every(q => q.tec === 'skimming'))) && (await page.evaluate(() => st.list.length)) === 15);
await page.evaluate(() => { st.list = [ALL.find(q => q.id === '2022-2')]; st.i = 0; show(); });
check('skimming escurece o miolo', !!(await page.$('#txt .dim')));
await page.screenshot({ path: `${out}/4-skimming.png`, fullPage: true });
await click('#more');
check('Ver texto completo libera tudo', !(await page.$('#txt .dim')));

// Erro, dica e explicação convivem.
await openQ('2024-2');
await page.evaluate(() => hint());
await click('#bB');
check('erro mostra a resposta certa', (await txt('#fb')).includes('Resposta: A'));
check('dica continua visível', (await txt('#hint')).includes('Dica'));
check('botões travam após responder', await page.$eval('#bC', e => e.disabled));

check('sem erros de página', errors.length === 0, errors.join(' ; '));
await browser.close();
console.log(fails ? `\n${fails} FALHA(S)` : '\nTUDO OK');
process.exit(fails ? 1 : 0);
