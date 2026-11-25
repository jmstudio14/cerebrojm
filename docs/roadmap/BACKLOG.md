# Backlog priorizado de CerebroJM

> Generado en la auditoría del 2026-11-18. La evidencia completa de cada `AUD-xxx` está en [TECHNICAL-AUDIT](../audit/TECHNICAL-AUDIT.md), y las funcionalidades `FEAT-xxx` en [FEATURE-GAP-ANALYSIS](../audit/FEATURE-GAP-ANALYSIS.md).
> **Estado** de todos los elementos: `Propuesto`, salvo los indicados en la tabla siguiente.

| ID | Estado | Nota |
|---|---|---|
| AUD-003, AUD-004, AUD-006, FEAT-002 | **Hecho** (2026-11-18) | ADR-0001 aceptado y fusionado en `main` (copia cifrada y zona personal fuera de Git) |
| AUD-001 | **Parcial** (2026-11-20) | El escáner conserva el BOM y el final de línea y ya no duplica el frontmatter (test en `escanear.test.mjs`). Falta la línea en blanco o los espacios iniciales, y el modo *fail-safe* para notas sin frontmatter |
| AUD-010 | **Parcial** (2026-11-20) | Un `UNTIL` mal formado ya no rompe la agenda (se ignora el límite). Falta aislar cada evento con `try/catch` y avisar del número de eventos ignorados; `BYDAY` y `DTSTART` inválidos sin comprobar |
| AUD-017 | **Parcial** (2026-11-20) | Las series `DAILY` saltan a la ventana pedida y ya no desaparecen por el tope de 5000 pasos. El resto de frecuencias conserva el tope |
| AUD-024 | **Hecho** (2026-11-20) | «Hoy» en fecha local en `escanear.mjs` y `estado.mjs` (tests con `TZ` UTC+14 y UTC-11) |
| AUD-029 | **Hecho** (2026-11-20) | La plantilla de revisión usa 14 días, como el Panel y `estado.mjs` |
| FEAT-003 | **Hecho de otra forma** (2026-11-19) | `repos.mjs` guarda `ultimo_push` e `issues_abiertos` en el frontmatter; sin releases ni estado de la CI |
| FEAT-004 | **Implementado, sin cerrar** | Subagente y comandos en `.claude/`; ver la Fase 2 en [ROADMAP](../../ROADMAP.md) |
| FEAT-013 | **Implementado, sin cerrar** | App en el repo `cerebrojm-app`; ver la Fase 3 en [ROADMAP](../../ROADMAP.md) |
| AUD-027 | **Superado** (2026-11-19) | `ultimo_push` es ahora un campo real, escrito por `repos.mjs` |
| AUD-021 | **Parcial** | El Panel separa «estancado» y «sin push»; no hay una señal de actividad local (FEAT-001) |
| AUD-022 | **Parcial** | `validar-vault.mjs` valida las herramientas; el Diagnóstico no. El acotado de estrellas en el índice está por confirmar |
| AUD-028 | **Parcial** (2026-11-25) | El README indica límites de recurrencia; no enumera los de AUD-012 y AUD-013 |
| AUD-033 | **Parcial** (2026-11-20) | CI con matriz Ubuntu y Windows; faltan `permissions` y acciones fijadas por SHA |
| AUD-039 | **Parcial** (2026-11-20) | CI en Windows hecha; faltan fixtures de algunos defectos |
| AUD-005 | **Parcial: riesgo aceptado** | Repo nuevo `cerebrojm` limpio y verificado (todas sus referencias). El repo antiguo `cerebrojm-antiguo` (privado, con el historial previo) no se ha borrado por decisión del usuario; riesgo bajo mientras siga siendo privado |

## Prioridades

| Nivel | Criterio |
|---|---|
| **P0** | Pérdida de datos, seguridad o corrupción |
| **P1** | Errores funcionales importantes |
| **P2** | Automatización, productividad, coherencia |
| **P3** | Mejoras visuales y funcionalidades futuras |

**Complejidad relativa** (no son estimaciones de tiempo):
- **S**: cambio local en un archivo, con pocos tests.
- **M**: varios archivos o tests nuevos de integración.
- **L**: diseño nuevo, varios componentes o un spike previo.

## Índice

| ID | Título | Tipo | Prioridad | Complejidad | Depende de |
|---|---|---|---|---|---|
| AUD-001 | El escáner corrompe el frontmatter con BOM o espacios iniciales | Defecto | P0 | S | — |
| AUD-002 | Colisión de nombres de fichas de herramienta | Defecto | P0 | S | — |
| AUD-003 | Datos personales sin copia de seguridad | Riesgo | P0 | — (lo resuelve FEAT-002) | FEAT-002 |
| AUD-004 | Política de privacidad que no coincide con `.gitignore` y la configuración de Obsidian | Inconsistencia | P0 | S | ADR-0001 aprobado |
| AUD-005 | Historial antiguo accesible en GitHub (rama de respaldo y `refs/pull/*`) | Defecto | P0 | S (acción manual) | Decisión del usuario |
| FEAT-002 | Copia de seguridad y restauración cifradas de la zona personal | Funcionalidad | P0 | M | ADR-0001, AUD-004 |
| AUD-010 | Un evento mal formado tumba toda la agenda | Defecto | P1 | S | — |
| FEAT-014 | Spike: `ical.js` dentro de DataviewJS | Spike | P1 | M | AUD-010 |
| AUD-011 | Recurrencias con TZID distinta de la del equipo, desfasadas 1 h | Defecto | P1 | M | FEAT-014 |
| AUD-012 | `BYSETPOS` con varios `BYDAY` | Defecto | P1 | M | FEAT-014 |
| AUD-013 | `DAILY` ignora `BYDAY` | Defecto | P1 | S | FEAT-014 |
| AUD-014 | `DURATION` no soportado | Defecto | P1 | S | FEAT-014 |
| AUD-020 | La actividad ignora el trabajo sin commit; la fecha sin Git no es recursiva | Defecto | P1 | M | FEAT-001 |
| FEAT-001 | Modelo temporal: `ultimo_commit`, `ultima_actividad`, `ultima_revision` | Funcionalidad | P1 | M | ADR-0005 |
| AUD-022 | Valores fuera de rango rompen índices; los datos locales nunca se validan | Defecto | P1 | M | — (parte 1, Fase A); FEAT-012 (parte 2, Fase B) |
| AUD-026 | Condición de carrera entre el escáner y Obsidian | Riesgo | P1 | S | AUD-001 |
| AUD-039 | Pruebas de regresión e integración que faltan, incluida CI en Windows | Calidad | P1 | M | — |
| AUD-006 | Nombre del equipo en los commits | Riesgo | P2 | S | — |
| AUD-015 | `RDATE` no soportado | Defecto | P2 | S | FEAT-014 |
| AUD-016 | Parámetros entre comillas con `:` | Defecto | P2 | S | FEAT-014 |
| AUD-017 | Tope de 5000 iteraciones | Defecto | P2 | S | FEAT-014 |
| AUD-018 | `YEARLY` con `BYMONTH`/`BYDAY` | Defecto | P2 | M | FEAT-014 |
| AUD-021 | El Panel no distingue actividad de revisión | Parcial | P2 | S | FEAT-001 |
| AUD-023 | Colisión por mayúsculas en Windows | Defecto | P2 | S | AUD-039 (CI Windows) |
| AUD-024 | `HOY` en UTC | Defecto | P2 | S | — |
| AUD-025 | Excepción del sistema de archivos que aborta el escaneo | Riesgo | P2 | S | — |
| AUD-027 | Fase 4 del ROADMAP obsoleta; `ultimo_push` frente a `ultimo_commit` | Inconsistencia | P2 | S | ADR-0007 |
| AUD-028 | El README promete más de lo que hay (copia de seguridad, calendario) | Inconsistencia | P2 | S | FEAT-002, FEAT-014 |
| AUD-029 | Umbral de "estancado" 14 frente a 7 días | Inconsistencia | P2 | S | FEAT-012 |
| AUD-030 | Valores permitidos duplicados en 6 sitios | Diseño | P2 | M | FEAT-012 |
| AUD-031 | Idempotencia solo dentro del mismo día | Defecto | P2 | S | — |
| AUD-033 | Endurecimiento de la CI | Riesgo | P2 | S | — |
| AUD-034 | Full Calendar sin mantenimiento | Riesgo | P2 | M | FEAT-014 |
| AUD-036 | Eventos de varios días solo el primer día | Parcial | P2 | S | FEAT-014 |
| FEAT-003 | Integración GitHub local (`gh`) | Funcionalidad | P2 | M | ADR-0007, FEAT-001 |
| FEAT-004 | Agente de proyectos (Claude Code) | Funcionalidad | P2 | L | ADR-0004, FEAT-001, FEAT-002, FEAT-003, Fase 1 cerrada |
| FEAT-005 | Gestión avanzada de tareas | Funcionalidad | P2 | M | FEAT-012 |
| FEAT-006 | Registro de decisiones por proyecto | Funcionalidad | P2 | S | — |
| FEAT-008 | Vistas con Bases (tarjetas por estado, tablas filtrables) | Funcionalidad | P2 | S | FEAT-012 |
| FEAT-009 | Catálogo de herramientas: configuración global, versiones, verificación | Funcionalidad | P2 | M | AUD-002 |
| FEAT-012 | Esquema único y validación local | Funcionalidad | P2 | M | ADR-0006 |
| AUD-032 | `escanear.bat` no comprueba la versión de Node | Defecto | P3 | S | — |
| AUD-035 | Plugins incluidos en Git y licencias | Riesgo | P3 | S | — |
| AUD-040 | Sin linter ni comprobación de tipos | Calidad | P3 | S | — |
| FEAT-007 | Captura rápida desde el móvil | Funcionalidad | P3 | M | Fase 6, FEAT-002 |
| FEAT-010 | Búsqueda semántica | Funcionalidad | P3 | — (aplazada) | Caso de uso real |
| FEAT-011 | Detección de notas duplicadas | Funcionalidad | P3 | S | — |
| FEAT-013 | App de escritorio Tauri | Funcionalidad | P3 | L | ADR-0003 (condición de entrada) |

---

## P0

### AUD-001 · El escáner corrompe el frontmatter con BOM o espacios iniciales
- **Problema:** si una nota empieza con BOM, una línea en blanco o espacios, `partir()` no reconoce el frontmatter. Al reescribir, el escáner pone uno nuevo y el original queda dentro del cuerpo.
- **Evidencia:** reproducido (TECHNICAL-AUDIT §2). `escanear.mjs:195-197`, `:287-295`, `:341-347`.
- **Archivos:** `_sistema/scripts/escanear.mjs`.
- **Solución:**
  1. Quitar BOM y espacios iniciales antes de parsear, y conservar el BOM al escribir.
  2. Si una nota existente no tiene frontmatter reconocible, **no escribir**: avisar y saltarla (*fail-safe*).
  3. Crear una copia `.bak` antes del primer cambio de cada ejecución, o confiar en FEAT-002.
- **Riesgos:** un falso positivo dejaría notas sin actualizar, pero el aviso lo hace visible.
- **Dependencias:** ninguna.
- **Criterios de aceptación:**
  - Con BOM, línea en blanco inicial, CRLF o frontmatter vacío, el resultado tiene **un solo** frontmatter.
  - Todos los campos manuales se conservan byte a byte.
  - Una nota sin frontmatter válido no se modifica y aparece en el resumen como "omitida".
- **Pruebas:** unitarias de `partir()` y regresión con 5 fixtures (BOM, CRLF, línea en blanco, sin frontmatter, frontmatter con `---` en el cuerpo).

### AUD-002 · Colisión de nombres de fichas de herramienta
- **Problema:** paquetes distintos con el mismo último segmento (`a/skills`, `b/skills`) escriben en el mismo archivo.
- **Evidencia:** reproducido. `escanear.mjs:163,166,425`.
- **Archivos:** `escanear.mjs`.
- **Solución:**
  1. Nombre de archivo determinista y único por `clave`, por ejemplo `skills (a)`, solo cuando hay colisión.
  2. Comprobar colisiones de nombre antes de escribir; si persisten, abortar esa ficha con un aviso.
  3. Guardar `clave` en el frontmatter para reconocer la ficha aunque cambie el nombre.
- **Riesgos:** renombrar fichas existentes rompe enlaces; usar `[[nombre]]` y avisar.
- **Criterios de aceptación:**
  - Dos orígenes distintos generan dos fichas, cada una con su origen y sus skills.
  - Volver a escanear no intercambia los contenidos.
  - La consola cuenta fichas reales.
- **Pruebas:** integración con dos proyectos y orígenes en colisión, en ambos órdenes de escaneo.

### AUD-003 · Datos personales sin copia de seguridad
- **Problema:** `01 Proyectos/` y `05 Herramientas/` están fuera de Git y no tienen ninguna copia.
- **Evidencia:** `.gitignore:17-20`; README §Privacidad.
- **Solución:** FEAT-002.
- **Criterios de aceptación:** FEAT-002 terminado y un simulacro de restauración documentado.
- **Pruebas:** las de FEAT-002.

### AUD-004 · Política de privacidad que no coincide con la configuración
- **Problema:** `CLAUDE.md` prohíbe subir datos personales, pero `02 Notas/`, `03 Diario/`, `04 Revisiones/` y `_sistema/adjuntos/` se suben cada 10 minutos.
- **Evidencia:** `.gitignore`, `.obsidian/app.json:3-4`, `obsidian-git/data.json:5`.
- **Archivos:** `.gitignore`, `CLAUDE.md`, `README.md`.
- **Solución:** aplicar la clasificación del ADR-0001: ignorar la zona personal, excepto los índices y `.gitkeep`.
- **Riesgos:**
  - El usuario pierde la sincronización de esas carpetas. Se compensa con FEAT-002.
  - Archivos ya versionados: hay que quitarlos del índice de Git sin borrarlos del disco.
- **Dependencias:** ADR-0001 aprobado.
- **Criterios de aceptación:**
  - `git check-ignore` confirma que una nota nueva en cada carpeta personal y un adjunto quedan ignorados.
  - Los índices siguen versionados.
  - Un test de la CI comprueba la lista.
- **Pruebas:** test de configuración en la CI (`git check-ignore` sobre rutas de ejemplo).

### AUD-005 · Historial antiguo accesible en GitHub
- **Problema:** la rama `respaldo-pre-limpieza-2026-11-18` y las referencias `refs/pull/1-8/head` contienen las notas con datos de los proyectos.
- **Evidencia:** `git ls-remote` y `git fetch refs/pull/7/head` (TECHNICAL-AUDIT §2).
- **Solución:**
  1. Borrar la rama de respaldo (requiere autorización explícita del usuario).
  2. Solicitar a GitHub Support la eliminación de las referencias de PR y de las vistas en caché, **o** crear un repositorio nuevo con el historial limpio y borrar o archivar el actual.
- **Riesgos:** se pierde la posibilidad de volver al estado anterior. Si hace falta, antes se guarda una copia local cifrada.
- **Criterios de aceptación:** `git ls-remote` no muestra ninguna referencia cuyo árbol contenga `01 Proyectos/*.md` (salvo el índice) ni `05 Herramientas/*.md` (salvo el índice).
- **Pruebas:** un script de verificación recorre todas las referencias remotas (`git ls-remote` y `git ls-tree` por referencia).

### FEAT-002 · Copia de seguridad y restauración cifradas de la zona personal
- **Necesidad:** AUD-003 y ADR-0001.
- **Archivos nuevos:** `respaldar.bat`, `restaurar.bat`, `_sistema/scripts/respaldar.mjs`, más tests.
- **Solución:** archivo con fecha, cifrado con contraseña (formato a elegir en un spike: 7-Zip AES-256 o `age`), destino configurable y retención de N copias.
- **Riesgos:** si se pierde la contraseña, se pierde la copia; documentarlo. Dependencia externa del cifrador: justificarla en el spike.
- **Dependencias:** ADR-0001 y AUD-004.
- **Criterios de aceptación:**
  - La copia contiene toda la zona personal y nada más.
  - Sin la contraseña no se puede leer.
  - La restauración en una carpeta vacía reproduce los archivos byte a byte.
  - La restauración sobre un vault existente no sobrescribe archivos más recientes sin confirmación.
  - La retención borra solo copias antiguas propias.
  - `Diagnóstico.md` muestra la antigüedad de la última copia.
- **Pruebas:** integración de ida y vuelta (respaldar → borrar → restaurar → comparar hashes), contraseña errónea, destino sin espacio o sin permisos, y una restauración manual en Windows (NOT RUN en CI).

---

## P1

### AUD-010 · Un evento mal formado tumba toda la agenda
- **Evidencia:** reproducido (`UNTIL=MAÑANA` → `TypeError`). `agenda.js:127,272`.
- **Solución:** aislar el procesamiento de cada evento (`try/catch` por evento), descartar el roto y mostrar un aviso con el número de eventos ignorados.
- **Criterios de aceptación:** un calendario con un evento roto muestra el resto y avisa: "1 evento ignorado".
- **Pruebas:** regresión con `UNTIL`, `BYDAY` y `DTSTART` inválidos.

### FEAT-014 · Spike: `ical.js` dentro de DataviewJS
- **Necesidad:** ADR-0002.
- **Criterios de aceptación:**
  - Informe con: carga en Obsidian de escritorio (sí/no), tiempo de render del Panel con un calendario real, tamaño del archivo incluido y resultado de los tests RED de AUD-011 a AUD-018.
  - Decisión final registrada en ADR-0002.
- **Pruebas:** los propios tests RED. Prueba manual en Obsidian (NOT RUN en CI).

### AUD-011 · Recurrencias con TZID distinta de la del equipo, desfasadas 1 h
- **Evidencia:** reproducido (NY 09:00 semanal visto desde Madrid el 26-oct → 14:00Z en lugar de 13:00Z). `agenda.js:100-103`.
- **Solución:** expandir en la zona `TZID` del evento (motor de FEAT-014, o cálculo en "hora de pared" de esa zona).
- **Criterios de aceptación:** las ocurrencias coinciden con Google Calendar entre los dos cambios de hora, en ambos sentidos (Europa/América).
- **Pruebas:** paramétricas con `TZ` de proceso distintas (Madrid, Nueva York, UTC).

### AUD-012 · `BYSETPOS` con varios `BYDAY`
- **Evidencia:** reproducido (5 ocurrencias en lugar de 1).
- **Criterios de aceptación:** "último laborable del mes" da exactamente una ocurrencia al mes.
- **Pruebas:** casos `BYSETPOS=1`, `-1` y `2`.

### AUD-013 · `DAILY` ignora `BYDAY`
- **Evidencia:** reproducido.
- **Criterios de aceptación:** no aparece ninguna ocurrencia en un día excluido por `BYDAY`.
- **Pruebas:** semana completa.

### AUD-014 · `DURATION` no soportado
- **Evidencia:** reproducido.
- **Criterios de aceptación:** `DURATION:PT2H` da fin = inicio + 2 h, y `P1D` en un evento de día completo dura un día.
- **Pruebas:** `PT90M`, `P1D`, `P1W`.

### FEAT-001 · Modelo temporal
- **Necesidad:** ADR-0005 y AUD-020.
- **Archivos:** `escanear.mjs`, plantilla de Proyecto, Panel y esquema.
- **Criterios de aceptación:**
  - El escáner escribe `ultima_actividad` y nunca escribe `ultima_revision`.
  - Un archivo modificado sin commit actualiza `ultima_actividad`.
  - Sin Git, se usa el archivo más reciente del árbol, recursivo, excluyendo `node_modules`, `.git` y carpetas ocultas, con un límite de entradas.
  - Las fechas se calculan en la zona local.
  - Las notas existentes conservan `ultima_revision`.
- **Pruebas:** integración con un repo temporal (commit antiguo más cambio sin commit), carpeta sin Git con archivo anidado y migración de una nota antigua.

### AUD-020 · La actividad ignora el trabajo sin commit
- **Evidencia:** reproducido.
- **Solución:** FEAT-001.
- **Criterios de aceptación:** los de FEAT-001.

### FEAT-012 · Esquema único y validación local
- **Necesidad:** ADR-0006, AUD-022, AUD-029 y AUD-030.
- **Archivos:** `_sistema/esquema.json` (nuevo), `validar-vault.mjs`, `escanear.mjs`, `Diagnóstico.md`, índices y documentación.
- **Criterios de aceptación:**
  - Un solo archivo define valores, rangos y umbrales.
  - El escáner valida los datos locales al terminar y muestra los errores.
  - `Diagnóstico.md` valida también las herramientas.
  - Un test de la CI falla si un umbral del Panel (`dur(N days)`) no coincide con el esquema.
- **Pruebas:** unitarias del validador con el esquema, y de coherencia entre el esquema y el Panel.

### AUD-022 · Valores fuera de rango rompen índices
- **Evidencia:** `"☆".repeat(-2)` → `RangeError` (ejecutado). `_Índice de herramientas.md:13`.
- **Solución:**
  1. Acotar `valoracion` en la vista (`Math.min(5, Math.max(0, n))`) y tratar los valores no numéricos.
  2. Validación local mediante FEAT-012.
- **Fases:** la parte 1 (acotar el valor en la vista) va en la Fase A, sin dependencias. La parte 2 (validación local) va en la Fase B, junto con FEAT-012.
- **Criterios de aceptación:** con `valoracion: 7`, `"abc"` o vacía, el índice se muestra y el valor erróneo aparece marcado.
- **Pruebas:** la función de estrellas extraída a un módulo y probada en la CI. Render en Obsidian NOT RUN.

### AUD-026 · Condición de carrera entre el escáner y Obsidian
- **Solución:** antes de renombrar, volver a leer el archivo. Si su contenido o su `mtime` cambiaron desde la lectura, abortar esa nota y avisar.
- **Criterios de aceptación:** una modificación concurrente simulada entre la lectura y la escritura no se pierde.
- **Pruebas:** integración con una función de prueba que modifica el archivo entre lectura y escritura.

### AUD-039 · Pruebas de regresión e integración que faltan, incluida CI en Windows
- **Solución:**
  - Matriz de CI `ubuntu-latest` + `windows-latest`.
  - Fixtures de AUD-001, 002, 010-018, 020, 022 y 023.
  - Las pruebas que requieren Obsidian, como lista manual en [QUALITY-STRATEGY](../testing/QUALITY-STRATEGY.md).
- **Criterios de aceptación:**
  - Cada defecto P0/P1 tiene un test que fallaba antes de la corrección (RED registrado en el PR) y pasa después.
  - La CI se ejecuta en Windows.

---

## P2

| ID | Solución | Criterios de aceptación | Pruebas |
|---|---|---|---|
| AUD-006 | Quitar `{{hostname}}` de `obsidian-git/data.json` | Los mensajes no contienen el nombre del equipo | Revisar la configuración en la CI |
| AUD-015 | `RDATE` (motor de FEAT-014) | Una ocurrencia extra por cada `RDATE` | Fixture |
| AUD-016 | Parser de propiedades que respete las comillas | `ALTREP` no altera el valor | Fixture |
| AUD-017 | Saltar directamente a la ventana pedida, o usar el motor de FEAT-014 | `DAILY` desde 2010 muestra las ocurrencias de hoy | Fixture |
| AUD-018 | `YEARLY` con `BYMONTH`/`BYDAY` (FEAT-014) | "Último domingo de marzo" es correcto 3 años seguidos | Fixture |
| AUD-021 | Columnas y alertas separadas "sin actividad" y "sin revisión" | Las dos señales aparecen por separado | Manual en Obsidian (NOT RUN) más prueba de la consulta extraída |
| AUD-023 | Comparar nombres sin distinguir mayúsculas al deduplicar | `App` y `app` generan dos notas distintas en Windows | CI Windows |
| AUD-024 | Fecha local (`toLocaleDateString('sv-SE')` o un cálculo manual) | A las 00:30 hora local la fecha es la de hoy | Unitaria con `TZ` y reloj simulado |
| AUD-025 | `try/catch` por carpeta con aviso | Una carpeta sin permisos no detiene el escaneo | Integración (en Linux con `chmod 000`; en Windows, manual) |
| AUD-027 | Reescribir la Fase 4 según el ADR-0007 y cambiar `ultimo_push` por `ultimo_commit` | `ROADMAP.md` no menciona `ultimo_push` ni una Action para las notas | Revisión documental |
| AUD-028 | Corregir las afirmaciones del README | El README no promete una copia de seguridad que no existe ni soporte completo de iCal | Revisión documental |
| AUD-029 | Un solo umbral desde el esquema (FEAT-012) | Panel, plantilla y documentación coinciden | Test de coherencia |
| AUD-030 | FEAT-012 | Los valores están definidos en un solo sitio | Test de coherencia |
| AUD-031 | Escribir `escaneado` y la fecha del bloque solo si cambian los datos | Dos escaneos en días distintos sin cambios no reescriben ninguna nota | Integración con `--hoy` distinto |
| AUD-033 | `permissions: contents: read`, acciones fijadas por SHA, matriz con Windows | El workflow lo cumple | Revisión del YAML |
| AUD-034 | Evaluar el fork "Remastered" u otra forma de configurar la URL iCal (`_sistema/config/calendario.local.json`) para no depender del `data.json` de Full Calendar | La agenda funciona sin Full Calendar | Integración de lectura de configuración |
| AUD-036 | Repetir los eventos de varios días en cada día que cubren | Un evento de 3 días aparece en los 3 | Unitaria de agrupación (función extraída) |

### FEAT-003 · Integración GitHub local (`gh`)
> Implementado de otra forma (2026-11-19): script aparte `repos.mjs`, que escribe en el frontmatter y, sin `gh` o sin sesión, termina con código 1. Lo que sigue es la propuesta original.

- **Solución:** ADR-0007. Opción `--github` del escáner; datos solo en el bloque automático.
- **Criterios de aceptación:**
  - Con `gh` disponible, el bloque muestra PRs e issues abiertos, último release y estado de la CI.
  - Sin `gh`, el escáner avisa y termina con éxito.
  - No se guarda ningún token.
- **Pruebas:** `gh` simulado (ejecutable falso en `PATH`) para la CI. Real en Windows, NOT RUN.

### FEAT-004 · Agente de proyectos (Claude Code)
- **Solución:** ADR-0004.
- **Criterios de aceptación:**
  - `/estado` coincide con el Panel.
  - `/fase` produce un plan que cita el `CLAUDE.md` y el `ROADMAP.md` del repo de destino.
  - `/implementar` solo actúa con un plan aprobado y termina en un PR en borrador con la evidencia de los tests.
  - Ninguna acción hace merge.
  - Cada acción queda en `## Registro`.
- **Pruebas:** escenarios de aceptación manuales sobre un repo de prueba (lista en QUALITY-STRATEGY). Comprobación de que el archivo del agente prohíbe merge y push a `main`.

### FEAT-005 · Gestión avanzada de tareas
- **Necesidad:** prioridades, vencimientos, dependencias, recurrencia y vistas globales.
- **Opciones:**
  - Campos en línea de Dataview (`[vence:: 2026-12-01]`, `[prioridad:: alta]`): sin dependencias nuevas.
  - Plugin *Tasks*: añade recurrencia, pero es otra dependencia.
- **Solución propuesta:** empezar por los campos de Dataview y vistas globales. Evaluar *Tasks* solo si la recurrencia se convierte en un caso de uso real.
- **Criterios de aceptación:**
  - Una vista global de tareas abiertas por vencimiento y prioridad.
  - Tareas vencidas en el Panel.
  - El formato de los campos está documentado en el esquema.
- **Pruebas:** validador de formato de campos en línea. Render NOT RUN.

### FEAT-006 · Registro de decisiones por proyecto
- **Solución:** plantilla "Decisión" (contexto, opciones, decisión, consecuencias) enlazada desde la nota del proyecto.
- **Criterios de aceptación:** la plantilla existe y el índice del proyecto lista sus decisiones.
- **Pruebas:** validación del frontmatter `tipo: decision`.

### FEAT-008 · Vistas con Bases
- **Solución:** archivos `.base` para tarjetas por estado y tablas filtrables, con *Bases* (núcleo, ya activado).
- **Criterios de aceptación:** una vista de tarjetas agrupada por `estado` y una tabla filtrable por `categoria` y `prioridad`, sin plugins nuevos.
- **Pruebas:** manual en Obsidian (NOT RUN). Es posible validar la sintaxis `.base` si existe documentación oficial del formato (por verificar).

### FEAT-009 · Catálogo de herramientas ampliado
- **Solución:**
  - Leer también la configuración **global** (`~/.claude/skills`, `~/.claude/agents`, `~/.claude/settings.json`, MCP de usuario) y las versiones declaradas.
  - Distinguir `detectada` / `instalada` / `verificada`.
  - Marcar como posiblemente obsoleta una herramienta sin uso en ningún proyecto durante N escaneos.
- **Criterios de aceptación:**
  - Cada ficha indica la fuente de detección y el nivel de verificación.
  - Ninguna ficha afirma que funciona sin una comprobación explícita.
- **Pruebas:** fixtures con un directorio `HOME` simulado.

---

## P3

| ID | Solución | Criterios de aceptación |
|---|---|---|
| AUD-032 | Comprobar `node --version` ≥ 18 en `escanear.bat` | Mensaje claro con Node 16 (prueba manual en Windows) |
| AUD-035 | Añadir los `LICENSE` de los plugins y evaluar no versionar los `main.js` (instalarlos desde Obsidian) | Las licencias están presentes; decisión documentada |
| AUD-040 | `// @ts-check` con JSDoc y `node --check` en la CI (sin dependencias) | La CI detecta errores de tipo básicos |
| FEAT-007 | Captura en la bandeja desde el móvil (depende de la Fase 6) | Una nota capturada en el móvil llega al PC sin pasos manuales |
| FEAT-010 | **Aplazada:** búsqueda semántica sin un caso de uso demostrado. La búsqueda global de Obsidian y el agente (FEAT-004) cubren la recuperación | Reabrir solo con un caso real que la búsqueda por texto no resuelva |
| FEAT-011 | Detectar notas con título o contenido casi idénticos (informe, no borrado) | Informe sin falsos positivos en un vault de prueba |
| FEAT-013 | App Tauri: solo si se cumple la condición del ADR-0003 | Decisión documentada con casos de uso |
