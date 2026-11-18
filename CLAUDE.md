# Instrucciones para Claude en este vault

Este repositorio es el sistema de un vault de Obsidian («cerebro digital»), sincronizado con GitHub mediante Obsidian Git. El idioma de las notas y respuestas es español.

## Límites y privacidad

- Este repositorio contiene solo el sistema, no los datos personales del vault. No copies, publiques ni incluyas en commits notas, adjuntos, rutas locales, resúmenes, código o configuración de otros proyectos.
- Las carpetas `01 Proyectos/`, `02 Notas/`, `03 Diario/`, `04 Revisiones/`, `05 Herramientas/` y los datos privados de configuración están excluidos de Git. Comprueba `.gitignore` y el diff antes de preparar cambios; no uses operaciones que incluyan datos ignorados.
- No leas ni modifiques datos personales salvo que la tarea lo requiera. No reveles en respuestas ni en documentación valores privados, como la URL de Google Calendar.
- Nunca edites `.obsidian/workspace*.json` ni crees, leas o subas `.obsidian/plugins/obsidian-full-calendar/data.json`.
- Los ejemplos de documentación deben ser genéricos, sin datos ni rutas reales del usuario.

## Cómo trabajar

- Antes de editar, comprueba el estado de Git y actualiza con `git pull --ff-only`. No descartes cambios existentes; si afectan al trabajo o hay conflictos, detente y pide indicaciones.
- Lee la plantilla, el README y las pruebas pertinentes antes de cambiar el formato o el comportamiento del sistema. Sigue los patrones existentes y limita el cambio a lo solicitado.
- Tras editar, revisa `git diff` para confirmar el alcance y que no haya datos personales. Ejecuta las pruebas pertinentes; si no puedes ejecutarlas, indícalo. No hagas commit ni push salvo que te lo pidan.
- No inventes información. Si un dato no puede verificarse, márcalo como «por confirmar».
- Usa fechas `AAAA-MM-DD` y enlaces internos `[[Nombre de nota]]` en lugar de rutas cuando escribas notas.

## Notas de proyectos

- Cada proyecto es una nota basada en `_sistema/plantillas/Proyecto.md`. Respeta los nombres de campos y valores permitidos que define la plantilla y documenta `README.md`; el Panel depende de ellos.
- Valores permitidos: `categoria`: `codigo`, `personal` o `creativo`; `estado`: `idea`, `activo`, `pausado`, `bloqueado`, `completado` o `archivado`; `prioridad`: `alta`, `media` o `baja`; `progreso`: entero de 0 a 100.
- Si modificas un proyecto, actualiza `ultima_revision` a la fecha actual y añade una línea breve y factual a `## Registro`. Las tareas van como `- [ ]` bajo `## Próximas tareas`.
- No cambies campos escritos por el usuario ni el contenido manual del proyecto al actualizar datos automáticos del escáner.

## Notas de herramientas

- Cada skill, agente, plugin o MCP se documenta como una nota basada en `_sistema/plantillas/Herramienta.md`. Respeta `clase` (`skill`, `agente`, `plugin`, `mcp`), `uso` (`frecuente`, `ocasional`, `probando`, `descartada`) y `valoracion` (1-5).
- No inventes el origen ni la descripción. Si el origen no está verificado, deja el campo `origen` vacío y escribe «por confirmar» en la sección **Origen**; usa la misma cautela para la descripción.

## Cambios en el sistema

- Al modificar el Panel, plantillas, scripts o plugins, actualiza `ROADMAP.md`: marca lo terminado y añade una entrada al registro de cambios.
- Respeta las fases y condiciones de entrada del roadmap. Mientras la Fase 1 siga abierta, no amplíes el alcance con funciones nuevas; atiende solo cambios solicitados y correcciones necesarias.
- Para cambios en formato o datos del vault, usa `node _sistema/tests/validar-vault.mjs` cuando corresponda. Para cambios de comportamiento, ejecuta las pruebas pertinentes, por ejemplo `node --test _sistema/tests/coherencia.test.mjs`.

## Tareas habituales

- **Estado de mis proyectos:** cuando se solicite, lee las notas de `01 Proyectos/` y resume por estado. Señala vencidos, bloqueados, estancados (más de 14 días sin revisión) y sin próxima acción; distingue los hechos de lo que no se pudo comprobar.
- **Revisión semanal:** cuando se solicite, crea `04 Revisiones/AAAA-MM-DD.md` desde `_sistema/plantillas/Revisión semanal.md` y complétala con datos reales, sin inventar ni publicar información personal.
