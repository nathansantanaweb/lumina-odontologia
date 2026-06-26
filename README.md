# Lumina Odontologia — demo

Vitrine premium de odontologia (demo para disparo). Site de luxo com **jornada 3D no scroll**
(Three.js) que degrada para uma **versão estática premium** quando não há WebGL, em
`prefers-reduced-motion`, ou no mobile.

> **Preview / demonstração.** Conteúdo de exemplo com marcadores `TROQUE:`. `noindex` ligado.

## Rodar localmente
Precisa de servidor (o 3D usa ES modules → `file://` é bloqueado por CORS):
```
python -m http.server 8800
```
Abra http://localhost:8800/

## Personalizar (por cliente)
- Edite os textos marcados com `TROQUE:` no `index.html`.
- WhatsApp/telefone: hoje placeholder `5511999999999` — trocar nos links `wa.me`/`tel:` e em
  `window.LUMINA.wa` (próximo passo: personalização por `?nome=&cidade=&whats=` na URL).
- Fotos reais (clínica, equipe, antes/depois) e dados pessoais entram **após o contrato**.
- Antes de vender: tirar `noindex`, pôr **CRO / responsável técnico** (regra CFO de anúncio).

## Estrutura
```
index.html
assets/css/    tokens.css · styles.css · styles-sections.css
assets/js/     ui.js · sections.js · quiz.js · scene3d.js
assets/vendor/ three.module.min.js
artigos/       exemplo.html
```
