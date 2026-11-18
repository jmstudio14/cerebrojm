# Instrucciones para Claude en este vault

Este repositorio es un vault de Obsidian ("cerebro digital") sincronizado con GitHub mediante el plugin Obsidian Git. Idioma: español.

## Reglas
- **Este repo es solo el sistema.** Nunca subas datos de los proyectos del usuario (notas de `01 Proyectos/` y `05 Herramientas/`, rutas, resúmenes, código o configuración de otros repos). Esas notas las genera `_sistema/scripts/escanear.mjs` en el PC del usuario y están en `.gitignore`. Los ejemplos de la documentación deben ser genéricos.
- Cada proyecto es una nota en `01 Proyectos/` (creada por el escáner o a mano) con el frontmatter de `_sistema/plantillas/Proyecto.md`. Respeta exactamente los nombres de campos y los valores permitidos (ver `README.md`); el Panel depende de ellos.
- Al modificar un proyecto, actualiza `ultima_revision` a la fecha de hoy y añade una línea al `## Registro`.
- Las tareas de un proyecto van como `- [ ]` bajo `## Próximas tareas`.
- Cada skill, agente, plugin o MCP es una nota en `05 Herramientas/` con el frontmatter de `_sistema/plantillas/Herramienta.md` (`clase`: skill·agente·plugin·mcp; `uso`: frecuente·ocasional·probando·descartada; `valoracion` 1-5). No inventes el origen ni la descripción: si no está verificado, escribe «por confirmar».
- Fechas siempre en formato `AAAA-MM-DD`.
- No edites `.obsidian/workspace*.json` ni crees ni subas `.obsidian/plugins/obsidian-full-calendar/data.json` (contiene la URL privada del calendario).
- Usa enlaces `[[Nota]]` entre notas en lugar de rutas.
- Al cambiar el propio sistema (Panel, plantillas, scripts, plugins), actualiza `ROADMAP.md`: marca lo hecho y añade una línea al registro de cambios.
- Commits pequeños y descriptivos; el usuario también hace commits automáticos desde Obsidian, así que haz `git pull` antes de empezar.

## Tareas habituales
- "Estado de mis proyectos": lee el frontmatter de `01 Proyectos/*.md` y resume por estado, señalando vencidos, bloqueados, estancados (>14 días sin revisión) y sin próxima acción.
- "Revisión semanal": crea `04 Revisiones/AAAA-MM-DD.md` a partir de la plantilla y rellena los apartados con datos reales.
