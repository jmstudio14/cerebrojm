# Registro de decisiones de arquitectura (ADR)

Cada ADR documenta una decisión con su contexto, las alternativas y sus consecuencias. Estado inicial de todos: **Propuesta**. Pasan a **Aceptada** o **Rechazada** cuando el usuario los revisa, y a **Sustituida** cuando la implementación tomó otro camino.

| ADR | Título | Estado | Resuelve |
|---|---|---|---|
| [0001](0001-datos-personales-y-backup.md) | Clasificación de datos, exclusión de Git y copia de seguridad | **Aceptada** | AUD-003, 004, 005, 006 |
| [0002](0002-motor-icalendar.md) | Motor iCalendar: parser propio frente a biblioteca | **Aceptada**; spike pendiente | AUD-010 a 018, 036 |
| [0003](0003-interfaz-obsidian-frente-a-app.md) | Interfaz: Obsidian frente a app propia | **Aceptada**, con enmienda: la app se construyó sin go/no-go previo | Fase 3, FEAT-008, 013 |
| [0004](0004-agente-de-proyectos.md) | Agente de proyectos con Claude Code | **Aceptada** | FEAT-004 |
| [0005](0005-modelo-temporal-del-proyecto.md) | Modelo temporal: commit, actividad y revisión | **Aceptada**, sin implementar | AUD-020, 021, 024 |
| [0006](0006-esquema-unico-de-metadatos.md) | Esquema único de metadatos | **Aceptada**, sin implementar | AUD-022, 029, 030 |
| [0007](0007-integracion-github-local.md) | Integración con GitHub local y bajo demanda | **Sustituida** por `repos.mjs` | AUD-027, FEAT-003 |
| [0008](0008-sincronizacion-movil.md) | Captura desde el móvil con Obsidian Sync | **Aceptada** | Fase 6, FEAT-007 |

Plantilla: Contexto → Decisión propuesta → Alternativas → Consecuencias.
