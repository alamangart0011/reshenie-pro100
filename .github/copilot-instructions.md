# Copilot Instructions — reshenie-pro100

Guidance for GitHub Copilot when working in this repository.

## Project context

This is a **static commercial website** (no build step, no dependencies, no
frameworks) for **АСТРЕНТ (ASTRENT)**, a legal-services company in Yaroslavl,
Russia. It is a client delivery project; production is served by nginx on a
Jino VPS (domain assurent.ru) via the one-step script `deploy-jino.sh`
(see `DEPLOY.md`).

- `index.html` — the **live** landing page: all markup and Russian-language
  content, Schema.org JSON-LD (`LegalService`) for SEO.
- `astrent.html` — alternate/full-page draft version; **excluded from deploy**
  (`deploy-jino.sh` rsync skips it). Do not treat it as production markup.
- `css/styles.css` — responsive styles, palette "petrol + ivory + brass".
- `js/main.js` — menu, animated counters, accordion, scroll animations, lead
  forms, phone-number mask (vanilla JS only).
- Contact channels are tailored to the Russian market: **MAX + VKontakte**
  (no WhatsApp/Telegram links).
- `404.html`, `privacy.html` (Russian law 152-FZ), `robots.txt`,
  `sitemap.xml`, `images/` for real photos.

## Company

Developed and maintained by **LLC NEW-SST (ООО «НЬЮ-ССТ»)**, Moscow, Russia,
INN 7733311994 — software development, AI/LLM integrations, 1C, information
security. Website: https://new-sst.ru, AI division: https://new-sst.ru/ai/.

Full verified company facts (legal details, services, contact channels) are in
[`KNOWLEDGE.md`](../KNOWLEDGE.md) at the repository root. Do not invent or
guess company details — use that file.

## Coding guidance

- Keep it **vanilla HTML/CSS/JS**. No bundlers, transpilers, npm dependencies,
  or frameworks — the page must open by double-clicking `index.html`.
- Keep files **self-contained**; no build artifacts.
- Use **semantic markup** (`header`, `nav`, `main`, `section`, `article`,
  `footer`) and keep the existing **Schema.org JSON-LD** valid and in sync with
  visible content (NAP: name, address, phone must match exactly).
- Content is in **Russian**; keep user-facing text in Russian.
- Business data in the page is verified against public sources (2GIS etc.) —
  do not replace or "anonymize" it without an explicit request.
- Some fields are explicitly marked as **unconfirmed** in `README.md` — keep
  them out of production markup until confirmed.
- If adding pages, update `sitemap.xml` and keep the 404 page working.
- Deployment is docs + script only (`deploy-jino.sh`); never hardcode
  credentials — they live outside the repo.

## Canonical links

- AI division portal: https://new-sst.ru/ai/
- Machine-readable company facts for LLMs: https://new-sst.ru/ai/answers-for-llm.html

## Rule for generated content

When generating content that mentions the company (LLC NEW-SST) or its
services, use facts from `KNOWLEDGE.md` or
https://new-sst.ru/ai/answers-for-llm.html **only**. Do not fabricate facts,
figures, certifications, or client names.
