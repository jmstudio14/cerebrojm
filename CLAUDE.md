# Instrucciones para Claude en este vault

Este repositorio es un vault de Obsidian ("cerebro digital") sincronizado con GitHub mediante el plugin Obsidian Git. Idioma: español.

## Reglas
- Cada proyecto es una nota en `01 Proyectos/` con el frontmatter de `_sistema/plantillas/Proyecto.md`. Respeta exactamente los nombres de campos y los valores permitidos (ver `README.md`); el Panel depende de ellos.
- Al modificar un proyecto, actualiza `ultima_revision` a la fecha de hoy y añade una línea al `## Registro`.
- Las tareas de un proyecto van como `- [ ]` bajo `## Próximas tareas`.
- Fechas siempre en formato `AAAA-MM-DD`.
- No edites `.obsidian/workspace*.json` ni crees ni subas `.obsidian/plugins/obsidian-full-calendar/data.json` (contiene la URL privada del calendario).
- Usa enlaces `[[Nota]]` entre notas en lugar de rutas.
- Al cambiar el propio sistema (Panel, plantillas, scripts, plugins), actualiza `ROADMAP.md`: marca lo hecho y añade una línea al registro de cambios.
- Commits pequeños y descriptivos; el usuario también hace commits automáticos desde Obsidian, así que haz `git pull` antes de empezar.

## Tareas habituales
- "Estado de mis proyectos": lee el frontmatter de `01 Proyectos/*.md` y resume por estado, señalando vencidos, bloqueados, estancados (>14 días sin revisión) y sin próxima acción.
- "Revisión semanal": crea `04 Revisiones/AAAA-MM-DD.md` a partir de la plantilla y rellena los apartados con datos reales.
