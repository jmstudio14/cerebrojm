# Instrucciones para Claude en este vault

Este repositorio es el sistema de un vault de Obsidian («cerebro digital»), sincronizado con GitHub mediante Obsidian Git. El idioma de las notas y respuestas es español.

## Límites y privacidad

- Este repositorio contiene solo el sistema, no los datos personales del vault. No copies, publiques ni incluyas en commits notas, adjuntos, rutas locales, resúmenes, código o configuración de otros proyectos.
- Las carpetas `01 Proyectos/`, `02 Notas/`, `03 Diario/`, `04 Revisiones/`, `05 Herramientas/` y los datos privados de configuración están excluidos de Git. Comprueba `.gitignore` y el diff antes de preparar cambios; no uses operaciones que incluyan datos ignorados.
- No leas ni modifiques datos personales salvo que la tarea lo requiera. No reveles en respuestas ni en documentación valores privados, como la URL de Google Calendar.
- Nunca edites `.obsidian/workspace*.json` ni crees, leas o subas `.obsidian/plugins/obsidian-full-calendar/data.json`.
- Los ejemplos de documentación deben ser genéricos, sin datos ni rutas reales del usuario.

## Cómo trabajar

- Antes de editar, comprueba el estado de Git con `git status` y `git branch --show-current`. Si hay cambios locales ajenos o conflictos, no los modifiques, sobrescribas ni limpies; pide indicaciones.
- Usa `git fetch` para comprobar sincronización. Ejecuta `git pull --ff-only` solo si no existen cambios locales incompatibles y la operación está dentro del flujo permitido.
- Lee la plantilla, el README y las pruebas pertinentes antes de cambiar el formato o el comportamiento del sistema. Sigue los patrones existentes y limita el cambio a lo solicitado.
- Tras editar, revisa `git diff` para confirmar el alcance y que no haya datos personales. Ejecuta las pruebas pertinentes; si no puedes ejecutarlas, indícalo. Aplica las reglas de branching y Git incluidas en este documento.
- No abras Obsidian, ni con depuración remota, mientras haya cambios sin commitear: Obsidian Git hace commit y push solo, al arrancar y cada 10 minutos, y sube lo pendiente sin que nadie lo apruebe. Descargar el plugin después de abrir llega tarde. Comprueba que `git status` está limpio antes de abrirlo.
- No inventes información. Si un dato no puede verificarse, márcalo como «por confirmar».
- Usa fechas `AAAA-MM-DD` y enlaces internos `[[Nombre de nota]]` en lugar de rutas cuando escribas notas.

## Reglas de branching

Son las de este repositorio. En los repos de otros proyectos, `/implementar` y `/seguimiento` siguen su propio flujo y el `CLAUDE.md` de cada repo.

- `main` es la rama de producción. No se hacen cambios ni merges directos en `main`.
- `develop` es la rama de desarrollo e integración. Se desarrolla y se prueba ahí.
- Cada nueva funcionalidad usa una rama `feature/<descripcion>`, creada desde `develop`.
- Cada corrección usa una rama `bugfix/<descripcion>`, creada desde `develop`.
- Las ramas `feature/*` y `bugfix/*` se integran en `develop` solo después de completar y verificar los cambios.
- Las features y bugfix se prueban antes de integrarlos en `develop`.
- La integración hacia `main` solo se realiza mediante Pull Request desde `develop`; requiere autorización expresa.

## Reglas de Git (Control de versiones)

- Haz commit solo cuando terminemos una funcionalidad o lo solicite expresamente el usuario.
- Antes de hacer commit, revisa `git diff` y `git diff --cached`; no incluyas secretos, datos personales ni archivos ignorados.
- El mensaje del commit debe ser breve, descriptivo y estar en español o seguir el formato existente del repositorio.
- Push permitido a la rama activa, siempre que sea `develop`, `feature/*` o `bugfix/*`.
- Push directo a `main`, prohibido.
- Merge autorizado solo hacia `develop` y solo después de terminar y probar el cambio.
- No uses merge para pasar cambios a `main`; usa una Pull Request desde `develop`.
- Si hay conflictos, cambios ajenos o la rama no coincide con el flujo previsto, detente y pide indicaciones.

## Flujo de Git normal

```text
develop -> feature/<descripcion> -> develop -> main (Pull Request)
develop -> bugfix/<descripcion> -> develop -> main (Pull Request)
```

1. Crear la rama desde `develop`.
2. Desarrollar y probar en la rama de feature o bugfix.
3. Cuando esté completa, probarla en `develop`.
4. Integrar el resultado en `develop`.
5. Integrar `develop` en `main` mediante Pull Request y autorización expresa.

## Buenas prácticas de cambios

- Mantén el diff acotado: no aproveches la tarea para hacer refactorizaciones, cambios de dependencias ni mejoras ajenas a lo solicitado.
- Si hay varias opciones razonables que cambian el comportamiento o el alcance, pregunta antes de decidir. Antes de borrar, sobrescribir o renombrar archivos, pide confirmación; conserva siempre los cambios preexistentes.
- Si preparas cambios para un commit, añade solo las rutas intencionadas; evita `git add -A` y cualquier operación que pueda incluir datos personales o ignorados.
- Al informar del resultado, indica qué verificaciones ejecutaste y sus resultados. No afirmes que algo funciona si no lo comprobaste.

## Alcance y modificación

- Antes de editar, identifica los archivos afectados y la razón de cada cambio.
- Haz cambios pequeños y relacionados; no refactorices ni cambies dependencias fuera del alcance.
- Conserva los archivos locales e ignorados; nunca incluyas datos personales en Git.
- No borres ni renombres archivos sin confirmación explícita del usuario.

## Pruebas y verificación

- Ejecuta primero la prueba mínima que cubra el cambio.
- Cuando corresponda, usa `node _sistema/tests/validar-vault.mjs`.
- Para cambios de comportamiento, ejecuta `node --test "_sistema/tests/*.test.*"` (como la CI); `coherencia.test.mjs` solo cubre `.gitignore`, los archivos versionados y los mensajes de commit.
- Tras cambiar el Panel, plantillas o scripts, actualiza `ROADMAP.md`.
- Reporta explícitamente qué pruebas se ejecutaron y cuáles no pudieron ejecutarse.

## Seguridad y privacidad

- Nunca publiques secretos, credenciales, enlaces privados, rutas locales o datos personales.
- No leas carpetas excluidas salvo que sean necesarias y el usuario autorice el acceso.
- Antes de un commit o push, revisa el diff y `git status`.
- No uses `git add -A`; añade solo las rutas previstas.

## Dependencias y herramientas

- Cambia el manifiesto de dependencias antes de instalar paquetes nuevos.
- Usa el gestor de paquetes existente; no añadas herramientas nuevas si ya existe una alternativa.
- No modifiques archivos `package-lock`, SQL o configuración generada sin necesidad.

## Terminología y convenciones

- Usa `main` y `develop` como nombres reales de ramas.
- Usa nombres de ramas ASCII y descriptivos: `feature/exportacion`, `bugfix/calculo-fechas`.
- Mantén español en documentación y notas del vault.
- No uses rutas absolutas en documentación ni archivos versionados.

## Notas de proyectos

- Cada proyecto es una nota basada en `_sistema/plantillas/Proyecto.md`. Respeta los nombres de campos y valores permitidos que define la plantilla y documenta `README.md`; el Panel depende de ellos.
- Valores permitidos: `categoria`: `codigo`, `personal` o `creativo`; `estado`: `idea`, `activo`, `pausado`, `bloqueado`, `completado` o `archivado`; `prioridad`: `alta`, `media` o `baja`; `progreso`: entero de 0 a 100.
- Si modificas un proyecto, actualiza `ultima_revision` a la fecha actual y añade una línea breve y factual a `## Registro`. Las tareas van como `- [ ]` bajo `## Próximas tareas`.
- No cambies campos escritos por el usuario ni el contenido manual del proyecto al actualizar datos automáticos del escáner.
- `ultimo_push` e `issues_abiertos` los escribe solo `repos.mjs`: no los edites a mano.

## Notas de herramientas

- Cada skill, agente, plugin o MCP se documenta como una nota basada en `_sistema/plantillas/Herramienta.md`. Respeta `clase` (`skill`, `agente`, `plugin`, `mcp`), `uso` (`frecuente`, `ocasional`, `probando`, `descartada`) y `valoracion` (1-5).
- No inventes el origen ni la descripción. Si el origen no está verificado, deja el campo `origen` vacío y escribe «por confirmar» en la sección **Origen**; usa la misma cautela para la descripción.

## Cambios en el sistema

- Al modificar el Panel, plantillas, scripts o plugins, actualiza `ROADMAP.md`: marca lo terminado y añade una entrada al registro de cambios.
- Respeta las fases y condiciones de entrada del roadmap. Mientras la Fase 1 siga abierta, no amplíes el alcance con funciones nuevas; atiende solo cambios solicitados y correcciones necesarias.
- Para cambios en formato o datos del vault, usa `node _sistema/tests/validar-vault.mjs` cuando corresponda. Para cambios de comportamiento, ejecuta las pruebas pertinentes, por ejemplo `node --test "_sistema/tests/*.test.*"`.

## Tareas habituales

- **Estado de mis proyectos:** cuando se solicite, lee las notas de `01 Proyectos/` y resume por estado. Señala vencidos, bloqueados, estancados (más de 14 días sin revisión), sin push (activos con `ultimo_push` de hace más de 30 días), sin próxima acción y con límite cercano (menos de 14 días); distingue los hechos de lo que no se pudo comprobar.
- **Revisión semanal:** cuando se solicite, crea `04 Revisiones/AAAA-MM-DD.md` desde `_sistema/plantillas/Revisión semanal.md` y complétala con datos reales, sin inventar ni publicar información personal.

## Selección de modelo

Equilibra precisión, latencia y cuota. Se aplica al delegar en subagentes (tool `Agent` con el parámetro `model`) y al recomendar cambios de modelo en la sesión principal (`/model`).

- **Automático en este vault:** `.claude/settings.json` fija `opusplan` (Opus en plan mode, Sonnet al ejecutar), y cada comando de `.claude/commands/` y agente de `.claude/agents/` fija su modelo en el frontmatter (`model:`). Un `/model` manual manda sobre `opusplan`.
- **Haiku (`haiku`), exploración y tareas atómicas:** búsqueda de archivos, símbolos o referencias; lectura de logs u outputs largos; extracción de datos (JSON, CSV, Markdown); boilerplate trivial, renombrados simples y tareas mecánicas. Nunca para diseñar lógica de negocio, modificar varios archivos acoplados ni depurar errores complejos.
- **Sonnet (`sonnet`), ejecución diaria (por defecto):** implementar features y lógica a partir de un plan claro; escribir y ejecutar tests; refactorizaciones acotadas (1 a 3 archivos); bugs estándar (sintaxis, tipos, errores locales); ciclos de leer, editar y verificar con herramientas y MCP.
- **Opus (`opus`), alto impacto cognitivo:** planificación inicial (arquitectura, esquemas de datos, contratos de API, planes de ejecución); debugging profundo (concurrencia, condiciones de carrera, fugas de memoria, bugs transversales) cuando Sonnet haya fallado 2 veces seguidas; auditorías de seguridad, casos límite y refactorizaciones que afecten a toda la estructura.

Reglas operativas:
1. **Planifica arriba, ejecuta abajo:** si la sesión está fijada a mano en Opus y la tarea es compleja, genera primero el plan paso a paso en Markdown y sugiere `/model sonnet` antes de la implementación masiva.
2. **Escalado automático por bloqueo:** si fallas 2 veces seguidas con el mismo error, detén los intentos y delega el diagnóstico de la causa raíz en un subagente con `model: "opus"`.
3. **Subagentes ligeros por defecto:** al delegar exploración o recopilación de contexto, usa `model: "haiku"`, salvo que la subtarea exija análisis lógico profundo.
