---
tipo: guia
---

# Guía rápida

Volver al [[00 Panel|Panel]]. Instalación y detalles: `README.md`. Evolución del sistema: [[ROADMAP]]. ¿Algo falla? [[Diagnóstico]].

## Cargar o actualizar tus proyectos
Doble clic en **`escanear.bat`** (carpeta del vault). La primera vez pregunta qué carpetas contienen tus proyectos (cada subcarpeta = un proyecto). Crea o actualiza las notas de `01 Proyectos/` y `05 Herramientas/` **sin pisar lo que escribes a mano** y sin subir nada a GitHub. Repítelo cuando crees un proyecto nuevo o antes de la revisión semanal.

## Rutina
| Cuándo | Qué | Dónde |
|---|---|---|
| Cada día (2 min) | Abrir la nota diaria, mirar la agenda y elegir máximo 3 focos | `Ctrl+P` → *Daily notes: Open today's daily note* |
| Al tocar un proyecto | Actualizar `estado`, `progreso`, `proxima_accion` y `ultima_revision`, y añadir una línea al Registro | Nota del proyecto |
| Cada semana (30 min) | Revisión semanal: vaciar la bandeja, revisar los estancados y limitar los activos | Nota nueva en `04 Revisiones/` con la plantilla **Revisión semanal** |
| Al terminar la revisión | Copia de seguridad cifrada de tus notas (no están en GitHub) | Doble clic en **`respaldar.bat`** |

## Dónde va cada cosa
- **Proyecto** (tiene un final): lo crea el escáner; si no está en una carpeta escaneada, nota en `01 Proyectos/` con la plantilla **Proyecto**. Ver [[_Índice de proyectos]].
- **Idea o nota suelta**: [[Bandeja de entrada]] o una nota en `02 Notas/`. Ver [[_Índice de notas]].
- **Día a día**: `03 Diario/`. Ver [[_Índice del diario]].
- **Revisiones**: `04 Revisiones/`. Ver [[_Índice de revisiones]].
- **Skill, agente, plugin o MCP**: `05 Herramientas/`, plantilla **Herramienta**. Ver [[_Índice de herramientas]].

## Estados de un proyecto
`idea` → `activo` → `completado`. En cualquier momento puede pasar a `pausado` o `bloqueado`, y `archivado` es para lo que abandonas. Pausar o archivar **a propósito** es mejor que dejar un proyecto "activo" sin tocarlo.

## Señales de alarma del Panel
- ⏰ **vencido**: la `fecha_limite` ya pasó.
- ⛔ **bloqueado**: escribe el motivo en *Bloqueos / riesgos*.
- ❓ **sin próxima acción**: no sabes cuál es el siguiente paso, y por eso no avanza.
- 💤 **estancado**: lleva más de 14 días sin revisión.
- Más de 4 activos: estás repartiendo demasiado la atención.

## Atajos útiles
- `Ctrl+P` → *Templates: Insert template*: insertar una plantilla.
- `Ctrl+P` → *Full Calendar: Open Calendar*: abrir el calendario.
- `Ctrl+P` → *Obsidian Git: Commit-and-sync*: sincronizar ahora.
- `Ctrl+O`: abrir una nota por su nombre.
