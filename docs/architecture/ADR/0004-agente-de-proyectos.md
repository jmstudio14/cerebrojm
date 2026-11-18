# ADR-0004 · Agente de proyectos con Claude Code

- **Estado:** Propuesta
- **Fecha:** 2026-11-18
- **Relacionado:** `ROADMAP.md` Fase 2, FEAT-004, FEAT-003

## Contexto

El usuario quiere un agente que consulte el estado de sus proyectos, analice sus repositorios, prepare planes e implemente fases autorizadas mediante Pull Requests.

## Decisión propuesta

**Forma:** subagente de Claude Code en el propio vault (`.claude/agents/gestor-proyectos.md`) más comandos (`.claude/commands/`). Sin servicio propio, sin servidor y sin base de datos.

| Comando | Lee | Escribe | Efectos externos |
|---|---|---|---|
| `/estado` | Notas de proyecto, salida del escáner, `gh` (FEAT-003) | Nada, o un informe en `04 Revisiones/` si se pide | Ninguno |
| `/revision` | Lo mismo | `04 Revisiones/AAAA-MM-DD.md` | Ninguno |
| `/fase <proyecto>` | `ROADMAP.md`, `CLAUDE.md`, tests y CI del repo del proyecto | Plan (modo plan) | Ninguno |
| `/implementar <proyecto>` | Plan **aprobado** | Rama nueva en el repo del proyecto | Push de la rama y **PR en borrador**. Nunca merge |

**Reglas obligatorias (verificables):**
1. El `CLAUDE.md` del repositorio de destino prevalece sobre las reglas del agente.
2. Nunca hace merge, push a `main`, reescritura de historial ni borrado de ramas.
3. No implementa sin un plan aprobado en esa misma sesión.
4. Una fase solo se da por terminada con evidencia: comando de test ejecutado y salida. Si el repo no tiene tests, lo declara y no marca la fase como terminada.
5. Registro de acciones: cada acción con efecto externo añade una línea a `## Registro` de la nota del proyecto (fecha, acción, rama, enlace al PR). Las notas son locales (ADR-0001), así que el registro no se publica.
6. Permisos mínimos: el agente no recibe tokens propios; usa la sesión de `gh` del usuario.

## Alternativas

| Opción | Motivo de descarte |
|---|---|
| Servicio propio (API y cola de trabajos) | Complejidad y mantenimiento desproporcionados para un usuario |
| GitHub Actions que modifiquen repos | No ve las notas locales (ADR-0001) y requiere tokens con permisos de escritura amplios |
| Agente totalmente autónomo con merge | El usuario lo rechazó; el riesgo es inaceptable en repos con pocas pruebas |

## Consecuencias

- Depende de FEAT-001 (fechas fiables) y de que la Fase 1 esté cerrada, para no planificar sobre datos deducidos.
- El registro local de acciones requiere la copia de seguridad (FEAT-002).
