---
description: Estado de mis proyectos por estado, con alertas, último push y PRs abiertos
allowed-tools: Bash(node:*), Bash(gh:*), Bash(git status:*), Bash(git pull --ff-only), Read, Edit
---

Usa el subagente `gestor-proyectos` o sigue estos pasos tú mismo, con las reglas de `CLAUDE.md`.

1. `git status` y `git pull --ff-only`. Si hay conflictos, detente.
2. `node _sistema/scripts/escanear.mjs` para refrescar los datos de los repos.
3. `node _sistema/scripts/estado.mjs`: es la fuente de las cifras y de las alertas (las mismas reglas que el Panel). No recalcules a mano.
4. Para cada proyecto `activo` o `bloqueado` cuyo campo `repo` sea una URL de GitHub (`https://github.com/<dueño>/<repo>`):
   - `gh api repos/<dueño>/<repo> --jq .pushed_at` → fecha del último push.
   - `gh pr list --repo <dueño>/<repo> --state open --json number,title,url`.
   - Escribe **solo** `ultimo_push: AAAA-MM-DD` en el frontmatter de esa nota (debajo de `ultimo_commit` si no existe). No cambies nada más ni toques `ultima_revision`: esto es un dato automático, no una revisión.
   - Si `repo` está vacío, no es de GitHub o `gh` falla, no lo inventes: apúntalo como «no se pudo comprobar» con la causa.
5. `node _sistema/tests/validar-vault.mjs` debe pasar.

Responde en el chat, sin escribir ninguna nota de resumen:
- Recuento por estado (`activo`, `bloqueado`, `pausado`, `idea`, `completado`, `archivado`).
- Vencidos, bloqueados, estancados (más de 14 días sin revisión), sin próxima acción y límite cercano, con el nombre de cada proyecto.
- PRs abiertos pendientes de revisión, con enlace.
- Qué no se pudo comprobar y por qué.
