# ADR-0001 · Clasificación de datos, exclusión de Git y copia de seguridad

- **Estado:** Propuesta (pendiente de aprobación)
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

3. **Limpieza en GitHub (AUD-005):**
   - borrar la rama `respaldo-pre-limpieza-2026-11-18`;
   - pedir a GitHub Support que elimine las referencias `refs/pull/*` y las vistas en caché, **o** crear un repositorio nuevo solo con el historial limpio y archivar o borrar el actual.

4. **Quitar `{{hostname}}`** de los mensajes de commit (AUD-006).

## Alternativas consideradas

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| **A. Zona personal fuera de Git y copia cifrada local** (propuesta) | Ningún dato personal llega a GitHub; sin dependencias externas | Hay que construir y probar copia y restauración; la copia depende de que el usuario la programe o la lance |
| B. Segundo repositorio privado solo para datos | Historial y sincronización entre equipos | Los datos siguen en GitHub, aunque sea privado, que es justo lo que el usuario rechazó |
| C. Cifrar en el repo (`git-crypt` o `age`) | Un solo repo | Más herramientas en Windows; si se pierde la clave, se pierde todo; los diffs dejan de ser legibles; Obsidian Git no lo gestiona bien |
| D. Obsidian Sync (de pago) para los datos personales | Cifrado de extremo a extremo y versiones | Coste recurrente; un servicio más |
| E. No hacer nada | — | Pérdida de datos probable a medio plazo (AUD-003) |

**Elección del cifrado:**
- Lo que no puede faltar es que el archivo se pueda descifrar sin la herramienta: 7-Zip con AES-256, o el formato `age`.
- No se añade ninguna dependencia npm sin un spike previo; la elección concreta queda para BL FEAT-002.

## Consecuencias

- `.gitignore` crece; Obsidian Git solo sube el sistema.
- El historial de las carpetas personales que ya se hayan subido seguirá en Git hasta otra limpieza. A día de hoy, `02`, `03` y `04` solo contienen índices y la bandeja vacía.
- Para trabajar en varios equipos hará falta otro mecanismo (copia/restauración u Obsidian Sync). Se decide en la Fase 6 (móvil).

## Criterios de aceptación

Ver FEAT-002 y AUD-004 en el [BACKLOG](../../roadmap/BACKLOG.md).
