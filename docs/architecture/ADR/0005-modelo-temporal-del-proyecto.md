# ADR-0005 · Modelo temporal de un proyecto: commit, actividad y revisión humana

- **Estado:** Propuesta
- **Fecha:** 2026-11-18
- **Relacionado:** AUD-020, AUD-021, AUD-024, FEAT-001

## Contexto

Hoy existen `ultimo_commit` (automático) y `ultima_revision` (humana). Al crear la nota, `ultima_revision` se rellena con la fecha del último commit (`escanear.mjs:255`). El Panel solo usa `ultima_revision`. El trabajo sin commit no se detecta (AUD-020).

## Decisión propuesta

Tres campos con responsabilidades separadas:

| Campo | Quién lo escribe | Significado | Fuente |
|---|---|---|---|
| `ultimo_commit` | Escáner | Fecha del último commit en la rama actual | `git log -1 --format=%cs` |
| `ultima_actividad` | Escáner | Último cambio real: el máximo entre el último commit y la fecha de modificación de los archivos que `git status --porcelain` da como modificados o nuevos. Sin Git, el archivo más reciente con recorrido recursivo limitado (sin `node_modules`, `.git`, `dist`, ni carpetas ocultas; con límite de entradas) | Git o sistema de archivos |
| `ultima_revision` | **Solo el usuario** (o el agente con su autorización) | Última vez que una persona revisó el proyecto en el vault | Manual |

**Reglas:**
- El escáner nunca escribe `ultima_revision`. Al crear una nota la deja vacía, y el Panel la mostrará como "nunca revisado".
- Las fechas se calculan en la zona local del equipo (corrige AUD-024).

**Panel:**
- **Sin actividad:** activo y sin `ultima_actividad` en 30 días.
- **Sin revisión:** activo y sin `ultima_revision` en 14 días, o sin ella.
- Son señales distintas, con umbrales en el esquema único (ADR-0006).

## Alternativas

- *Una sola fecha*: es la que hay hoy. Mezcla dos preguntas distintas ("¿se trabaja?" y "¿lo estoy gestionando?").
- *`mtime` de todo el árbol sin límite*: es lento en repos grandes y cuenta archivos generados.

## Consecuencias

- Hay que migrar las notas existentes: los campos se añaden sin pisar nada y `ultima_revision` se conserva tal cual. Lo prueba un test.
- `git status` añade un proceso más por proyecto. El coste se mide en el test de rendimiento (QUALITY-STRATEGY).
