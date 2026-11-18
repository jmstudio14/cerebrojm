# Resumen ejecutivo · Auditoría de CerebroJM (2026-11-18)

## Estado actual en una frase

El sistema está bien planteado: vault de Markdown, scripts locales sin dependencias, CI con pruebas y datos personales fuera de Git. Pero **no está listo para empezar a usarse en real**: hay defectos que pueden corromper o perder lo que el usuario escriba a mano, y el historial de GitHub todavía contiene datos personales.

## Cifras

| Indicador | Valor |
|---|---|
| Defectos confirmados **por ejecución** | 13 |
| Defectos confirmados por inspección | 5 |
| Riesgos | 7 |
| Inconsistencias documentación/código | 5 |
| Hipótesis pendientes de Obsidian o Windows | 5 grupos |
| Pruebas existentes | 13/13 en verde |
| Cobertura de líneas | escáner 95,5 %, agenda 66,5 % |

> Que la cobertura del escáner sea alta y aun así tenga tres defectos reproducibles muestra que **las pruebas actuales cubren el camino feliz, no los bordes**.

## Riesgos principales (P0)

1. **El historial antiguo sigue en GitHub (AUD-005).**
   - La rama `respaldo-pre-limpieza-2026-11-18` y las referencias de solo lectura de los 8 PRs (`refs/pull/*/head`) contienen las notas con datos de los proyectos.
   - La limpieza del 2026-11-18 es incompleta.
   - Las referencias de PR solo las puede borrar GitHub Support, o hay que recrear el repo.
2. **El escáner puede desplazar los campos manuales (AUD-001).**
   - Si una nota empieza con BOM o una línea en blanco, el escáner escribe un frontmatter nuevo y el original deja de leerse como propiedades.
   - Reproducido.
3. **Fichas de herramientas que se pisan entre sí (AUD-002).**
   - Dos paquetes con el mismo nombre final acaban en una sola ficha con datos mezclados.
   - Reproducido.
4. **Sin copia de seguridad (AUD-003).**
   - Todo lo que el usuario escriba en `01 Proyectos/` y `05 Herramientas/` existe en un único disco.
5. **La privacidad no coincide con la configuración (AUD-004).**
   - Las notas, el diario, las revisiones y los adjuntos sí se suben a GitHub cada 10 minutos, en contra de la regla de `CLAUDE.md`.

## Errores funcionales destacados (P1)

- Un solo evento mal formado deja **toda la agenda** en blanco (AUD-010).
- Las recurrencias de eventos en otra zona horaria se desplazan 1 hora durante algunas semanas al año (AUD-011).
- No se soportan `DURATION` ni ciertos patrones (`BYSETPOS`, `DAILY+BYDAY`).
- El escáner no ve el trabajo sin commit: un proyecto activo puede aparecer como "archivado" (AUD-020).
- Un valor fuera de rango en una ficha rompe el índice de herramientas, y los datos locales nunca se validan (AUD-022).

## Recomendaciones

1. **Antes de clonar y usar el sistema:** ejecutar la nueva **Fase A** del [MASTER-ROADMAP](../roadmap/MASTER-ROADMAP.md).
   - Cerrar AUD-005.
   - Aprobar el ADR-0001 (qué es personal).
   - Corregir AUD-001, 002, 010 y 022.
   - Construir la copia de seguridad cifrada (FEAT-002).
2. **Calendario:** no reescribir el parser a ciegas. Hacer un spike con `ical.js`, que es la biblioteca que ya incluye Full Calendar ([ADR-0002](../architecture/ADR/0002-motor-icalendar.md)).
3. **Interfaz:** mantener Obsidian y aprovechar *Bases*, que ya está activado. La app Tauri queda condicionada a evidencia ([ADR-0003](../architecture/ADR/0003-interfaz-obsidian-frente-a-app.md)).
4. **GitHub:** sustituir la "GitHub Action" de la Fase 4 por una consulta local con `gh` ([ADR-0007](../architecture/ADR/0007-integracion-github-local.md)). La Action no puede ver notas que están fuera de Git.
5. **Agente:** mantener el diseño de la Fase 2 (solo PR, nunca merge), con requisitos explícitos: fechas fiables y copia de seguridad ([ADR-0004](../architecture/ADR/0004-agente-de-proyectos.md)).
6. **Proceso:** TDD obligatorio. Ningún PR de corrección sin su test RED previo ([QUALITY-STRATEGY](../testing/QUALITY-STRATEGY.md)).

## Limitaciones de esta auditoría

- **No se ha ejecutado Obsidian.** Ninguna consulta Dataview ni DataviewJS se ha comprobado renderizada.
- **No se ha ejecutado en Windows:** rutas, mayúsculas, `.bat`, versión de Node.
- **No se ha consultado Context7,** que no estaba disponible en el entorno. Las versiones de bibliotecas salen del registro npm. El estado de Full Calendar sale de fuentes secundarias (Obsidian Stats y la página de releases), no de la API de GitHub.
- No se han medido el rendimiento con muchos proyectos ni el tamaño real de un calendario.
- No se han evaluado los datos reales del usuario, que por diseño no están en el repo.

## Documentos

- [TECHNICAL-AUDIT](TECHNICAL-AUDIT.md): evidencia detallada.
- [FEATURE-GAP-ANALYSIS](FEATURE-GAP-ANALYSIS.md): funcionalidades existentes, parciales y ausentes.
- [TARGET-ARCHITECTURE](../architecture/TARGET-ARCHITECTURE.md) y [ADR](../architecture/ADR/README.md).
- [MASTER-ROADMAP](../roadmap/MASTER-ROADMAP.md) y [BACKLOG](../roadmap/BACKLOG.md).
- [QUALITY-STRATEGY](../testing/QUALITY-STRATEGY.md).
