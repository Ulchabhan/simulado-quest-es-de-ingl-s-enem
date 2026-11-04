# Simulado ENEM – como gerar o APK

## Opção A – GitHub (sem instalar nada além do VS Code)
1. Abra esta pasta no VS Code.
2. Crie a pasta `.github/workflows` e mova para dentro dela o arquivo `build-apk.yml` (ele está na raiz).
3. Painel "Controle do Código-Fonte" → "Publicar no GitHub" (pode ser repositório privado).
4. No site do GitHub, abra o repositório → aba **Actions** → "Build APK" roda sozinho (~5 min).
5. Ao terminar, clique na execução → em **Artifacts**, baixe `SimuladoENEM-apk` (zip com o `app-debug.apk`).
6. Envie o APK aos alunos (Drive/WhatsApp). No celular: abrir o arquivo → permitir "instalar apps desconhecidos".

## Opção B – Android Studio
Abra esta pasta no Android Studio → Build → Build APK(s). O APK fica em `app/build/outputs/apk/debug/`.

## Testar sem APK
Abra `app/src/main/assets/www/index.html` no navegador (funciona também no celular).

## Editar conteúdo
As questões e o dicionário são gerados: não edite `www/data/*.js` à mão. Veja `tools/question-bank/README.md`.
Imagens das questões: `app/src/main/assets/www/img/`.
