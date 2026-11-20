---
description: Crea la nota de la revisión semanal de hoy con datos reales
allowed-tools: Bash(node:*), Bash(git status:*), Bash(git pull --ff-only), Read, Write, Glob
model: sonnet
---

Usa el subagente `gestor-proyectos` o sigue estos pasos tú mismo, con las reglas de `CLAUDE.md`.

1. `git status` y `git pull --ff-only`. Si hay conflictos, detente.
2. Calcula la fecha de hoy (`AAAA-MM-DD`). Si `04 Revisiones/AAAA-MM-DD.md` ya existe, **no la sobrescribas**: dilo y detente.
3. Crea `04 Revisiones/AAAA-MM-DD.md` copiando `_sistema/plantillas/Revisión semanal.md` y sustituyendo `{{date}}` por la fecha de hoy.
4. Ejecuta `node _sistema/scripts/estado.mjs` y añade al final de la nota una sección `## 5. Datos del día` con, solo lo que devuelve el script: recuento por estado y los proyectos vencidos, bloqueados, estancados, sin push (+30 días), sin próxima acción y con límite cercano. Enlázalos con `[[Nombre del proyecto]]`.
5. No marques ninguna casilla del checklist ni rellenes `## 4. Decisiones`: son del usuario.
6. `node _sistema/tests/validar-vault.mjs` debe pasar.

Responde con la ruta de la nota creada y un resumen de dos líneas. Sin datos inventados: lo que no se pueda comprobar, «por confirmar».
