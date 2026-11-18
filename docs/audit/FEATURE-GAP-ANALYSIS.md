# Análisis de funcionalidades: existentes, parciales y ausentes

> Base: inspección de `main` (`b5d0b84`). "Existe" significa que el código o la configuración lo implementan. **No** implica que se haya verificado en Obsidian o en Windows: ver la columna "Verificado".

## Leyenda

| Estado | Significado |
|---|---|
| ✅ Existe | Implementado y cubierto por pruebas o por inspección |
| 🟡 Parcial | Implementado con limitaciones documentadas |
| ❌ Ausente | No existe |
| 🧪 Propuesto | Especificado en el backlog |

---

## 1. Gestión de proyectos

| Capacidad | Estado | Detalle / evidencia | Verificado | Backlog |
|---|---|---|---|---|
| Nota por proyecto con frontmatter estándar | ✅ | Plantilla y escáner | CI | — |
| Alta automática desde carpetas | ✅ | `escanear.mjs` | CI (Linux) | — |
| Estado, prioridad, progreso, próxima acción | ✅ | Campos manuales | CI (validador) | — |
| Alertas: vencido, bloqueado, sin próxima acción, estancado | ✅ | `00 Panel.md` | NOT RUN (Obsidian) | — |
| Último commit | 🟡 | Solo `git log -1`; ignora el trabajo sin commit | Ejecutado (AUD-020) | FEAT-001 |
| Actividad real frente a revisión humana | ❌ | Las dos fechas se mezclan | — | FEAT-001, ADR-0005 |
| Detección de proyectos inactivos | 🟡 | Solo por revisión humana (14 días) | — | FEAT-001, AUD-021 |
| Estado del repositorio en GitHub (PRs, issues, releases, CI) | ❌ | — | — | FEAT-003 |
| Commits recientes | ❌ | Solo el último | — | FEAT-003 |
| Seguimiento de fases | 🟡 | Se detecta si hay `ROADMAP.md`, pero no se lee | — | FEAT-004 (`/fase`) |
| Historial de decisiones | 🟡 | `## Registro` libre en la nota | — | FEAT-006 |
| Proyectos sin Git | 🟡 | Fecha de primer nivel, no recursiva | Ejecutado | FEAT-001 |

## 2. Agente de proyectos

| Capacidad | Estado | Backlog |
|---|---|---|
| Consultar el estado de los proyectos | ❌ (diseñado en `ROADMAP.md` Fase 2) | FEAT-004 |
| Analizar repos, detectar tareas, preparar planes | ❌ | FEAT-004 |
| Ejecutar fases autorizadas, ramas, PRs, pruebas e informes | ❌ | FEAT-004 |
| Prohibir merge, respetar `CLAUDE.md` de destino, registrar acciones | ❌ (reglas definidas) | ADR-0004 |

Condiciones exigidas por el usuario y dónde se cumplen:
- **Nunca fusionar:** regla 2 del ADR-0004 y criterio de aceptación de FEAT-004.
- **No modificar sin autorización:** regla 3 (plan aprobado).
- **Respetar el `CLAUDE.md` de cada repo:** regla 1.
- **Sin evidencia no hay fase terminada:** regla 4.
- **Registro de acciones:** regla 5.

## 3. Gestión avanzada de tareas

| Capacidad | Estado | Detalle | Backlog |
|---|---|---|---|
| Tareas por proyecto (`- [ ]` bajo *Próximas tareas*) | ✅ | Consulta TASK del Panel. La documentación de Dataview confirma que hereda los campos de la página | — |
| Tareas en notas diarias | ✅ | Índice del diario | — |
| Prioridades, vencimientos y etiquetas por tarea | ❌ | — | FEAT-005 |
| Tareas recurrentes | ❌ | Requeriría el plugin *Tasks* | FEAT-005 (evaluar) |
| Dependencias entre tareas | ❌ | — | FEAT-005 |
| Vista global de tareas | 🟡 | Solo proyectos activos o bloqueados y diario | FEAT-005 |

## 4. Catálogo de herramientas

| Capacidad | Estado | Detalle | Backlog |
|---|---|---|---|
| Skills (lock y carpetas), MCP (`.mcp.json`) y agentes (`.claude/agents`) por proyecto | ✅ | Escáner | — |
| Procedencia e instalación | 🟡 | Solo si `skills-lock.json` declara el origen | FEAT-009 |
| Proyectos que la usan | ✅ | `uso_en` | — |
| Configuración global (`~/.claude`) | ❌ | — | FEAT-009 |
| Plugins de Claude Code y aplicaciones | ❌ | `clase: plugin` existe solo en la plantilla | FEAT-009 |
| Versiones y compatibilidad | ❌ | — | FEAT-009 |
| Detección de obsoletas | ❌ | — | FEAT-009 |
| Presencia frente a disponibilidad verificada | ❌ | Las fichas solo indican presencia (se avisa al usuario) | FEAT-009 |
| Unicidad de las fichas | ❌ | Colisión de nombres | AUD-002 |

## 5. Cerebro de conocimiento

Cada propuesta se justifica con un caso de uso real; no se añade IA por moda.

| Capacidad | Estado | Caso de uso real | Recomendación |
|---|---|---|---|
| Búsqueda global por texto | ✅ (Obsidian, núcleo) | "¿Dónde apunté X?" | Suficiente |
| Relaciones entre notas | ✅ (enlaces, backlinks, grafo) | Navegar de un proyecto a sus decisiones | Suficiente; reforzar con FEAT-006 |
| Captura rápida | 🟡 (bandeja en el escritorio) | Capturar una idea desde el móvil | FEAT-007, tras la Fase 6 |
| Registro de decisiones | 🟡 | "¿Por qué elegí esta tecnología?" | FEAT-006 |
| Base de conocimiento entre proyectos | 🟡 (`02 Notas`) | Reutilizar soluciones | Convención de etiquetas; sin desarrollo nuevo |
| Búsqueda semántica | ❌ | No hay un caso que la búsqueda por texto no resuelva | **Aplazada** (FEAT-010). El agente (FEAT-004) puede responder preguntas sobre el vault sin infraestructura de *embeddings* |
| Detección de duplicados | ❌ | Bajo valor con un vault pequeño | FEAT-011, P3 |

## 6. Interfaz

| Opción | Estado | Recomendación |
|---|---|---|
| Panel Dataview | ✅ (NOT RUN en Obsidian) | Mantener |
| Kanban / tarjetas | ❌ | **Bases** (núcleo, ya activado) antes que plugins: FEAT-008 |
| Calendario | ✅ (Full Calendar) / 🟡 (agenda propia con defectos) | FEAT-014 y AUD-034 |
| Dashboard avanzado | 🟡 | Bases más Panel |
| Interfaz móvil | ❌ (no evaluada) | Fase 6 |
| App de escritorio | ❌ (Fase 3, condicionada) | ADR-0003: solo con casos de uso que Obsidian no cubra |

## 7. Seguridad y datos

| Capacidad | Estado | Backlog |
|---|---|---|
| URL del calendario fuera de Git | ✅ | — |
| Datos de proyectos fuera de Git | ✅ (`01`, `05`) / ❌ (`02`, `03`, `04`, adjuntos) | AUD-004 |
| Copia de seguridad de los datos personales | ❌ | FEAT-002 |
| Historial de GitHub sin datos personales | ❌ (rama de respaldo y `refs/pull`) | AUD-005 |
| Validación de los datos locales | ❌ | FEAT-012 |
