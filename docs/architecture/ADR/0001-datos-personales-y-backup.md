# ADR-0001 · Clasificación de datos, exclusión de Git y copia de seguridad

- **Estado:** **Aceptada** el 2026-11-18. Decisión del usuario: zona personal fuera de Git, copia cifrada local y, para AUD-005, la opción "repositorio nuevo y limpio".
- **Fecha:** 2026-11-18
- **Relacionado:** AUD-003, AUD-004, AUD-005, AUD-006

## Contexto

- El repositorio debe contener solo el **sistema** (regla en `CLAUDE.md`). Hoy solo `01 Proyectos/` y `05 Herramientas/` están fuera de Git.
- Obsidian Git sube cada 10 minutos el resto de carpetas: `02 Notas/`, `03 Diario/`, `04 Revisiones/` y los adjuntos de `_sistema/adjuntos/`. Ahí el usuario escribe sobre sus proyectos (AUD-004).
- Lo que está fuera de Git no tiene copia de seguridad (AUD-003).

## Decisión propuesta

1. **Clasificar las carpetas en dos zonas:**

   | Zona | Carpetas | ¿Git? |
   |---|---|---|
   | Sistema | `00 Panel.md`, `_sistema/` (salvo `adjuntos/` y `config/*.local.json`), índices `_Índice*.md`, plantillas, docs, `.obsidian/` (configuración) | Sí |
   | Personal | `01 Proyectos/`, `02 Notas/`, `03 Diario/`, `04 Revisiones/`, `05 Herramientas/`, `_sistema/adjuntos/` (todo salvo los índices) | **No** |

2. **Copia de seguridad local y cifrada de la zona personal,** con un script (`respaldar.bat` → `_sistema/scripts/respaldar.mjs`) que:
   - empaqueta la zona personal en un archivo con fecha;
   - lo cifra con contraseña;
   - lo guarda en una carpeta que elige el usuario (disco externo o una carpeta sincronizada en la nube: el contenido va cifrado);
   - conserva las N últimas copias;
   - incluye `restaurar.bat`, que recupera la copia sin sobrescribir archivos más recientes sin confirmación.

3. **Limpieza en GitHub (AUD-005):** opción elegida: **repositorio nuevo y limpio**. El usuario renombra el actual a `cerebrojm-antiguo`, crea uno vacío `cerebrojm`, se migran las ramas limpias, se verifican todas las referencias y se borra el antiguo. El proxy de Git del entorno de trabajo no permite borrar la rama de respaldo; desaparece con el repositorio antiguo.

4. **Quitar `{{hostname}}`** de los mensajes de commit (AUD-006).

## Alternativas consideradas

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| **A. Zona personal fuera de Git y copia cifrada local** (propuesta) | Ningún dato personal llega a GitHub; sin dependencias externas | Hay que construir y probar copia y restauración; la copia depende de que el usuario la programe o la lance |
| B. Segundo repositorio privado solo para datos | Historial y sincronización entre equipos | Los datos siguen en GitHub, aunque sea privado, que es justo lo que el usuario rechazó |
| C. Cifrar en el repo (`git-crypt` o `age`) | Un solo repo | Más herramientas en Windows; si se pierde la clave, se pierde todo; los diffs dejan de ser legibles; Obsidian Git no lo gestiona bien |
| D. Obsidian Sync (de pago) para los datos personales | Cifrado de extremo a extremo y versiones | Coste recurrente; un servicio más |
| E. No hacer nada | — | Pérdida de datos probable a medio plazo (AUD-003) |

**Elección del cifrado (implementada):** `node:crypto` con AES-256-GCM y clave derivada por scrypt, y `node:zlib`. No añade dependencias: Node ya es un requisito del escáner. Contrapartida: la copia solo la abre `restaurar.mjs`, que forma parte del propio sistema.

## Consecuencias

- `.gitignore` crece; Obsidian Git solo sube el sistema.
- El historial de las carpetas personales que ya se hayan subido seguirá en Git hasta otra limpieza. A día de hoy, `02`, `03` y `04` solo contienen índices y la bandeja vacía.
- Para trabajar en varios equipos hará falta otro mecanismo (copia/restauración u Obsidian Sync). Se decide en la Fase 6 (móvil): ver [ADR-0008](0008-sincronizacion-movil.md), que cubre solo la captura desde el móvil.

## Criterios de aceptación

Ver FEAT-002 y AUD-004 en el [BACKLOG](../../roadmap/BACKLOG.md).
