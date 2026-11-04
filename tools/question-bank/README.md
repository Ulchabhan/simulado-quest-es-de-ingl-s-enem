# Banco de questões e dicionário

Estes scripts geram `app/src/main/assets/www/data/questions.js`, `data/dict.js` e as figuras em `www/img/`.
Os dados brutos não ficam no repositório, porque são grandes. Nesta máquina, eles estão em `F:\android-toolchain\bank-data`.

## Preparar
Rode `npm install pdfjs-dist@4.10.38 @napi-rs/canvas@0.1.65 puppeteer-core@23.11.1` nesta pasta.

## Dados brutos
Dentro de uma pasta de dados (`<dados>`):
- `inep/`: PDFs de `https://download.inep.gov.br/enem/provas_e_gabaritos/`, nos formatos `AAAA_PV_impresso_D1_CD1.pdf`, `AAAA_GB_impresso_D1_CD1.pdf` e `AAAA_PV_reaplicacao_PPL_D1_CD1.pdf`, `AAAA_GB_reaplicacao_PPL_D1_CD1.pdf`.
- `dict/english.jsonl`: `https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl` (cerca de 3,2 GB).
- `legacy/q02.jpg`: imagem antiga da questão `ppl2019-1`, disponível no histórico do Git.

## Gerar, nesta ordem
1. `node extract-exams.mjs <dados>/inep <dados>/raw.txt <dados>/keys.json`
2. `node render.mjs <dados>/inep <dados>/pages 2`
3. `node build-questions.mjs <dados> <www>` (para com erro se faltar gabarito, alternativa, fonte ou se a pista não estiver no texto)
4. `node filter-dict.mjs <dados>/dict/english.jsonl <dados>/questions.json <dados>/dict/filtered.jsonl`
5. `node build-dict.mjs <dados>/dict/filtered.jsonl <dados>/questions.json <www>`
6. `node e2e.mjs <www>/index.html <pasta-de-capturas>` (usa o Microsoft Edge instalado)

## Onde editar
- Técnica, dica, explicação e pista de cada questão: `questions-src.mjs`.
- Locuções e palavras escritas à mão: `glossary.mjs`.
- Tradução dos verbos e conjugador do português: `verbs.mjs`. Verbo novo entra na tabela `VERBS`; se for irregular, também em `IRR`.
- A letra correta de 2020–2025 vem do gabarito oficial (`keys.json`), nunca é digitada à mão.

Ao adicionar questões, rode os passos 3 a 6: palavras novas precisam entrar no dicionário.

## Licenças
- `www/data/dict.js` contém dados do Wiktionary obtidos via kaikki.org, sob CC BY-SA 4.0, combinados com o glossário deste projeto. Mantenha a atribuição na tela inicial e distribua esse arquivo sob a mesma licença.
- Textos, imagens e questões pertencem aos respectivos autores e ao Inep. Eles são reproduzidos aqui para fins educacionais e não estão cobertos pela licença do dicionário.
