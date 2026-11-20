# ADR-0007 · Integración con GitHub: local y bajo demanda

- **Estado:** Sustituida por la implementación de `repos.mjs` (2026-11-20)
- **Fecha:** 2026-11-18
- **Relacionado:** AUD-027, FEAT-003, `ROADMAP.md` Fase 4

> **Sustituida (2026-11-20):** se mantiene la idea de fondo (local, bajo demanda, con `gh` y sin tokens en el vault), pero la implementación es otra. Un script propio, `_sistema/scripts/repos.mjs` (con `repos.bat`), consulta GitHub y escribe dos campos del **frontmatter** de cada nota: `ultimo_push` e `issues_abiertos`. No es una opción `--github` del escáner ni escribe en el bloque automático. Si `gh` falla o tarda más de 30 s, avisa, deja la nota intacta y termina con código 1. PRs abiertos, último release y estado del workflow no se guardan: `/estado` consulta los PRs bajo demanda con `gh`.

## Contexto

La Fase 4 de `ROADMAP.md` propone una GitHub Action que actualice `ultimo_push` en las notas. Desde que las notas de proyecto están en `.gitignore` (ADR-0001), una Action **no puede verlas ni modificarlas** (AUD-027).

## Decisión propuesta

- El escáner, opcionalmente (`--github`), consulta GitHub desde el PC del usuario con la CLI `gh` ya autenticada:
  - PRs abiertos;
  - issues abiertos;
  - último release;
  - estado del último workflow en la rama por defecto.
- El resultado va solo al **bloque automático** de la nota. No se crean campos que el usuario tenga que mantener.
- Si `gh` no está instalado o no ha iniciado sesión, el escáner avisa y sigue sin datos de GitHub (degradación controlada).
- No se guarda ningún token en el vault: la credencial la gestiona `gh` (gestor de credenciales del sistema).

## Alternativas

| Opción | Motivo |
|---|---|
| GitHub Action programada | No ve los datos locales; necesita un token con permisos sobre todos los repos |
| API REST con un token en `escaner.local.json` | Un token en texto plano en disco. Se descarta frente a `gh` |
| Servidor MCP de GitHub dentro de Claude Code | Válido para el **agente** (ADR-0004), no para el escáner determinista |

## Consecuencias

- La Fase 4 de `ROADMAP.md` debe reescribirse (ver MASTER-ROADMAP).
- Depende de tener `gh` instalado en Windows (dependencia opcional y documentada).
