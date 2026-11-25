# Auditoría técnica de CerebroJM

> **Foto del 2026-11-18.** No se actualiza: el estado vigente está en [ROADMAP](../../ROADMAP.md) y [BACKLOG](../roadmap/BACKLOG.md).

> Estado auditado: rama `main`, commit `b5d0b84` (2026-11-18).
> Alcance: todo el contenido versionado del repositorio, sus ramas y referencias en GitHub, la CI y los plugins incluidos.
> Fuera de alcance: los datos personales del usuario (`01 Proyectos/`, `05 Herramientas/`), que no están en el repositorio por diseño.

## Cómo leer este documento

Cada hallazgo indica su **tipo de evidencia**:

| Etiqueta | Significado |
|---|---|
| **DEFECTO · ejecución** | Reproducido ejecutando el código real con un caso de prueba. El experimento se describe en el hallazgo. |
| **DEFECTO · inspección** | Deducido leyendo el código, con la línea exacta. Sin reproducción. |
| **RIESGO** | Puede causar daño en ciertas condiciones; no es un fallo hoy. |
| **INCONSISTENCIA** | La documentación y el código (o dos documentos) dicen cosas distintas. |
| **HIPÓTESIS · NOT RUN** | Requiere Obsidian, Windows o un servicio externo para confirmarse. No se afirma como defecto. |
| **AUSENTE / PARCIAL** | Funcionalidad inexistente o incompleta (detalle en [FEATURE-GAP-ANALYSIS](FEATURE-GAP-ANALYSIS.md)). |

Los identificadores `AUD-xxx` coinciden con los del [BACKLOG](../roadmap/BACKLOG.md).

---

## 1. Reconocimiento

### 1.1 Estructura

| Elemento | Ubicación | Notas |
|---|---|---|
| Panel principal | `00 Panel.md` | 1 bloque DataviewJS, 1 llamada a `agenda.js`, 7 consultas DQL |
| Índices | `0x …/_Índice*.md` | Dataview/DataviewJS por carpeta |
| Plantillas | `_sistema/plantillas/` | Proyecto, Herramienta, Nota, Nota diaria, Revisión semanal |
| Escáner | `_sistema/scripts/escanear.mjs` (443 líneas) + `escanear.bat` | Node ≥ 17 (usa `readline/promises`) |
| Agenda | `_sistema/scripts/agenda.js` (319 líneas) | Parser iCalendar propio + render DataviewJS |
| Diagnóstico | `_sistema/Diagnóstico.md` | Autocomprobación en Obsidian |
| Validador | `_sistema/tests/validar-vault.mjs` | Valida frontmatter de proyectos y herramientas |
| Tests | `_sistema/tests/*.test.*` | `node:test`, sin dependencias |
| CI | `.github/workflows/validar.yml` | Ubuntu, Node 22 |
| Plugins incluidos | `.obsidian/plugins/` | Dataview 0.5.68, Obsidian Git 2.43.0, Full Calendar 0.10.7 (≈ 5,7 MB de `main.js`) |
| Documentación | `README.md`, `ROADMAP.md`, `CLAUDE.md`, `Guía rápida.md` | |

### 1.2 Historial y ramas

- `main` y `ccr-5fb79795-l1vohy` apuntan a `b5d0b84`, con 19 commits tras reescribir el historial el 2026-11-18.
- La rama `respaldo-pre-limpieza-2026-11-18` (`1fe6884`) conserva el historial **anterior** a la limpieza.
- GitHub mantiene `refs/pull/1/head` … `refs/pull/8/head`, que apuntan a los commits **anteriores** a la limpieza. Ver **AUD-005**.

### 1.3 Pruebas existentes (ejecutadas en esta auditoría)

| Suite | Resultado | Cobertura de líneas medida (`node --test --experimental-test-coverage`, Node 22.23.5) |
|---|---|---|
| `agenda.test.js` | 8/8 PASS | `agenda.js`: 66,5 % (no cubre el render en Obsidian, líneas 233-319) |
| `escanear.test.mjs` | 5/5 PASS | `escanear.mjs`: 95,5 % · ramas 74 % |
| `validar-vault.mjs` sobre el repo | PASS | Valida 0 proyectos y 0 herramientas: el repo no contiene datos. |

> **Cobertura ≠ calidad.** El escáner tiene un 95 % de líneas cubiertas, y aun así esta auditoría reproduce en él tres defectos (AUD-001, AUD-002, AUD-020) que las pruebas no detectan.

---

## 2. Integridad y protección de datos

### AUD-001 · El escáner duplica el frontmatter y desplaza los campos manuales si la nota empieza con BOM · **DEFECTO · ejecución** · P0

- **Código:** `escanear.mjs:195-197`. `partir()` solo reconoce el frontmatter si el archivo empieza exactamente por `---`. Si no, devuelve `fm: ""` y `actualizarProyecto()` escribe un frontmatter nuevo encima del texto original.
- **Experimento:** se escanea un proyecto, se cambia `estado: bloqueado`, se antepone un BOM UTF-8 (como hacen algunos editores de Windows) y se vuelve a escanear.
  - **Resultado:** el archivo queda con tres líneas `---`. Arriba aparece un frontmatter nuevo que solo tiene `repo`, `ruta_local`, `ultimo_commit` y `escaneado`.
  - El frontmatter original (con `estado`, `prioridad`, `proxima_accion`…) pasa al cuerpo, así que Obsidian deja de leerlo como propiedades.
- **Impacto:** se pierden de las propiedades (sin borrarlos del archivo) los campos que el usuario edita a mano, y el proyecto desaparece de todas las vistas del Panel. Ocurre de forma silenciosa.
- **También afectado:** `actualizarHerramienta()` (`escanear.mjs:341-347`), con la misma lógica.

### AUD-002 · Dos paquetes de skills con el mismo nombre final se sobrescriben en una sola ficha · **DEFECTO · ejecución** · P0

- **Código:** las herramientas se agrupan por `clave` (`skill:autorA/skills`), pero el archivo se nombra con `h.nombre`, que es el último segmento (`skills`) (`escanear.mjs:163,166,425`). No hay control de colisión por nombre de archivo.
- **Experimento:** dos proyectos con `skills-lock.json` de orígenes `autorA/skills` y `autorB/skills`.
  - **Resultado:** se genera un solo `skills.md`, con `origen` de `autorA` y la lista de skills de `autorB`, mientras la consola informa de "2 herramientas".
- **Impacto:** fichas con datos mezclados y no fiables. La ficha cambia en cada escaneo según el orden de los proyectos.

### AUD-003 · Los datos personales no tienen copia de seguridad · **RIESGO (confirmado por configuración)** · P0

- **Configuración:** `01 Proyectos/*` y `05 Herramientas/*` están excluidos de Git (`.gitignore:17-20`). Es deliberado (ver [ADR-0001](../architecture/ADR/0001-datos-personales-y-backup.md)).
- **Consecuencia:**
  - Lo que escribe el usuario a mano (estado, prioridad, próxima acción, registro, valoraciones) solo existe en un disco.
  - Un fallo de disco, un borrado accidental o un cambio de equipo lo pierden.
  - Volver a escanear solo regenera los campos automáticos.
- **Inconsistencia relacionada (AUD-028):** `README.md:61` afirma "copia de seguridad sin pensar en ello", y eso ya no es cierto para estas carpetas.

### AUD-004 · La política de privacidad no coincide con la configuración: notas, diario, revisiones y adjuntos se suben a GitHub · **INCONSISTENCIA (confirmada)** · P0

- **La regla:** `CLAUDE.md` dice "Nunca subas datos de los proyectos del usuario".
- **Lo que hace la configuración:**
  - Obsidian Git hace commit y push cada 10 minutos (`obsidian-git/data.json:5`) de todo lo que no esté en `.gitignore`.
  - Eso incluye `02 Notas/`, `03 Diario/`, `04 Revisiones/` y la carpeta de adjuntos `_sistema/adjuntos` (`app.json:4`): las capturas o imágenes pegadas en cualquier nota se subirían.
  - Las notas nuevas se crean por defecto en `02 Notas` (`app.json:3`).
- **Por qué importa:** la plantilla de revisión semanal y la nota diaria están pensadas para hablar de los proyectos. El texto que escriba el usuario en ellas acabaría en GitHub.
- **Pendiente:** decidir explícitamente qué datos son "sistema" y cuáles "personales" ([ADR-0001](../architecture/ADR/0001-datos-personales-y-backup.md)).

### AUD-005 · GitHub conserva el historial anterior a la limpieza · **DEFECTO · ejecución** · P0

- **Comprobación** (`git ls-remote origin`):
  - La rama `respaldo-pre-limpieza-2026-11-18` sigue publicada.
  - Las referencias de solo lectura `refs/pull/1/head` a `refs/pull/8/head` apuntan a los commits **originales**.
- **Experimento:** `git fetch origin refs/pull/7/head` devuelve un árbol con `01 Proyectos/<notas de proyectos reales>`.
- **Consecuencia:** la limpieza del historial del 2026-11-18 **no es completa**. `main` está limpio, pero los datos siguen descargables por cualquiera con acceso al repo.
- **Límite:** las referencias `refs/pull/*` no se pueden borrar desde Git. Solo GitHub Support puede eliminarlas, o se puede recrear el repositorio.
- **Atenuante:** el repo es privado, así que la exposición se limita a quien tenga acceso.

### AUD-006 · El nombre del equipo aparece en los mensajes de commit · **RIESGO (confirmado por configuración)** · P2

- `obsidian-git/data.json:2-3` usa `{{hostname}}` en los mensajes automáticos, que se publican en GitHub.

### AUD-026 · Condición de carrera entre el escáner y Obsidian · **RIESGO** · P1

- `escribirSiCambia()` (`escanear.mjs:218-224`) lee, calcula y reescribe el archivo sin comprobar si cambió entre medias.
- Si el usuario tiene la nota abierta y escribe durante el escaneo, la edición puede perderse. La escritura es atómica (archivo temporal y renombrado), pero no detecta conflictos.

---

## 3. Escáner de proyectos

| Aspecto | Estado | Evidencia |
|---|---|---|
| Detección de proyectos | **PARCIAL** | Toda subcarpeta no oculta de una carpeta madre es un proyecto. Solo recorre un nivel: no reconoce agrupaciones ni monorepos. `escanear.mjs:384-386` |
| Proyectos sin Git | Funciona, con límites | La fecha viene de `fechaArchivoMasReciente()`, que **no es recursiva**. Ver AUD-020 |
| Actividad Git | **PARCIAL** | Solo usa `git log -1 --format=%cs`. Ver AUD-020 |
| Cambios sin commit | **AUSENTE** | Ver AUD-020 |
| Stack | Heurística razonable | `detectarStack()` mira `package.json`, Python, Rust, Go y .NET. No detecta Java, PHP, Ruby ni otros |
| README / ROADMAP / CLAUDE.md | Funciona | `escanear.mjs:397` |
| Tests | Heurística | Carpetas `tests`, `test`, `e2e`… y el script `test` de npm |
| Herramientas | **PARCIAL** | Lee `skills-lock.json`, `.claude/skills`, `.agents/skills`, `.mcp.json` y `.claude/agents`. No lee la configuración global de `~/.claude` ni versiones. Presencia ≠ funcionamiento |
| Errores y permisos | **RIESGO** | Ver AUD-025 |
| Duplicados | **DEFECTO** | AUD-002 (herramientas) y AUD-023 (mayúsculas en Windows) |
| Rendimiento | Sin medir | Lanza 3 procesos `git` por proyecto, de forma síncrona. Lineal; aceptable a priori para decenas de proyectos. Sin benchmark |
| Idempotencia | **PARCIAL** | AUD-031 |

### AUD-020 · La "fecha de actividad" ignora el trabajo sin commit y, sin Git, solo mira el primer nivel · **DEFECTO · ejecución** · P1

- **Código:** `escanear.mjs:388` (`git log -1`) y `escanear.mjs:68-75`. La alternativa sin Git solo hace `stat` de las entradas de primer nivel; la fecha de una carpeta no cambia cuando se edita un archivo dentro.
- **Experimento:** repo con el último commit el 2026-01-01 y un archivo modificado hoy sin commit.
  - **Resultado:** `estado: archivado`, `ultima_revision: 2026-01-01`.
- **Problema de modelo:** se mezclan tres fechas distintas, y el Panel solo usa una ([ADR-0005](../architecture/ADR/0005-modelo-temporal-del-proyecto.md)):
  1. **último commit**: el campo `ultimo_commit`;
  2. **última modificación del código**: no existe;
  3. **última revisión humana**: el campo `ultima_revision`. Al crear la nota se rellena con la fecha del último commit (`escanear.mjs:255`), así que confunde actividad con revisión.

### AUD-023 · Colisión de nombres que solo difieren en mayúsculas en Windows · **DEFECTO · inspección** + **HIPÓTESIS · NOT RUN (Windows)** · P2

- `escanear.mjs:391` compara nombres distinguiendo mayúsculas. NTFS no las distingue.
- Dos carpetas `App` y `app` en carpetas madre distintas escribirían en el mismo archivo, alternando `ruta_local`.

### AUD-024 · `HOY` se calcula en UTC · **DEFECTO · inspección** · P2

- `escanear.mjs:30`: `new Date().toISOString().slice(0,10)`.
- En España, entre las 00:00 y la 01:00 (las 02:00 en verano), `escaneado` y la fecha del registro quedan con el día anterior.

### AUD-025 · Una excepción del sistema de archivos aborta el escaneo completo · **RIESGO (inspección)** · P2

- `fs.realpathSync(dir)` (`escanear.mjs:387`) no está protegido. Un bucle de enlaces o un permiso denegado lanza una excepción que termina el proceso entero (`main().catch` → `exit 1`), en lugar de saltarse esa carpeta.

### AUD-031 · La idempotencia solo se cumple dentro del mismo día · **DEFECTO · inspección** · P2

- El bloque automático incluye la fecha de hoy (`escanear.mjs:230,299`) y `escaneado: HOY`.
- Por eso cada escaneo en un día distinto reescribe **todas** las notas aunque nada haya cambiado: más escrituras, más recargas en Obsidian y más ventana para AUD-026.
- El test de idempotencia pasa porque usa la misma `--hoy` en las dos ejecuciones.

### AUD-032 · `escanear.bat` no comprueba la versión de Node · **DEFECTO · inspección** · P3

- `escanear.bat:5` solo comprueba que `node` exista.
- `readline/promises` requiere Node ≥ 17. Con una versión anterior el error sería críptico. El README pide ≥ 18.

---

## 4. Calendario (`agenda.js`)

**Experimentos:** ejecutados con `TZ=Europe/Madrid` sobre el parser real (`parsearICS` + `ocurrencias`).

| ID | Caso | Esperado (RFC 5545) | Obtenido | Tipo |
|---|---|---|---|---|
| AUD-010 | Un evento con `UNTIL` inválido junto a otro válido | Ignorar el roto y mostrar el válido | `TypeError` que tumba **toda** la agenda (`agenda.js:127`, sin `try` por evento en `:272`) | DEFECTO · ejecución · **P1** |
| AUD-011 | Semanal `TZID=America/New_York 09:00`, visto desde Madrid el 26-oct (Madrid ya en horario de invierno, Nueva York aún en verano) | 13:00Z | 14:00Z. La expansión usa la hora local del equipo (`agenda.js:100-103`) | DEFECTO · ejecución · **P1** |
| AUD-012 | `FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1` | 1 ocurrencia (30-nov) | 5 ocurrencias. `BYSETPOS` se aplica a cada día por separado (`agenda.js:158`) | DEFECTO · ejecución · P1 |
| AUD-013 | `FREQ=DAILY;BYDAY=MO..FR` | Solo laborables | Incluye sábado y domingo. `BYDAY` se ignora en DAILY (`agenda.js:143-145`) | DEFECTO · ejecución · P1 |
| AUD-014 | `DURATION:PT2H` sin `DTEND` | Fin a las 10:00Z | Fin igual al inicio. `DURATION` no se parsea | DEFECTO · ejecución · P1 |
| AUD-015 | `RDATE` | 2 ocurrencias | 1. `RDATE` no se parsea | DEFECTO · ejecución · P2 |
| AUD-016 | `LOCATION;ALTREP="http://…":Sala 1` | `Sala 1` | `//x.y/z":Sala 1`. Se corta en el primer `:` sin respetar comillas (`agenda.js:18`) | DEFECTO · ejecución · P2 |
| AUD-017 | `FREQ=DAILY` desde 2010 | 3 ocurrencias en el rango | 0. Tope de 5000 iteraciones desde `DTSTART` (`agenda.js:141`) | DEFECTO · ejecución · P2 |
| AUD-018 | `FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU` | Último domingo de marzo | `BYMONTH` y `BYDAY` se ignoran en YEARLY | DEFECTO · inspección · P2 |
| AUD-036 | Evento de varios días | Visible cada día | Solo se agrupa en el día de inicio (`agenda.js:301`) | PARCIAL · inspección · P2 |
| — | `EXDATE`, `RECURRENCE-ID`, `STATUS:CANCELLED`, todo el día, `COUNT`, mensual "2.º martes", TZID con cambio de hora en la **misma** zona del equipo | — | Correcto (8 tests existentes) | PASS |
| — | `RECURRENCE-ID;RANGE=THISANDFUTURE` | Afectar a las siguientes | No soportado | AUSENTE · inspección · P3 |
| — | TZID no IANA (nombres de Windows/Outlook) | Resolver la zona | Usa el desfase local como alternativa (`agenda.js:46-48`) | PARCIAL · inspección · P3 (Google exporta IANA) |
| — | Evento sin `UID` | Funcionar | Funciona; solo puede confundir excepciones (`undefined\|…`) | RIESGO bajo |
| — | `DTSTART` inválido | Descartar | Se descarta en silencio, sin avisar | PARCIAL |

**Otros:**

- **Caché:** `localStorage` (`agenda.js:259`) guarda el ICS completo. Un calendario grande puede superar la cuota, y entonces falla en silencio (lo captura el `catch`), así que el modo sin conexión no funcionaría.
  **HIPÓTESIS · NOT RUN.** Depende del tamaño real del calendario.
- **`requestUrl`:** no está verificado si Obsidian lo expone como global o solo mediante `require("obsidian")`. El código prueba ambos caminos.
  **HIPÓTESIS · NOT RUN.** Lo comprueba `Diagnóstico.md`.
- **Parser propio frente a biblioteca:**
  - El plugin Full Calendar ya incluye `ical.js` dentro de su `main.js`: el texto aparece 4 veces y también `ICAL.Time`.
  - La recomendación y la comparación están en [ADR-0002](../architecture/ADR/0002-motor-icalendar.md).

---

## 5. Obsidian y experiencia de usuario

| ID | Hallazgo | Tipo | Prioridad |
|---|---|---|---|
| AUD-022 | `estrellas(v)` en `_Índice de herramientas.md:13` lanza `RangeError` si `valoracion` no está entre 0 y 5 (comprobado: `"☆".repeat(-2)`), y rompe el índice entero. El validador solo se ejecuta en la CI, sobre el repo, que no contiene datos personales. **Ningún mecanismo valida los datos reales en local.** `Diagnóstico.md` valida proyectos, no herramientas. | DEFECTO · ejecución (JS) | P1 |
| AUD-029 | Umbral de "estancado": 14 días en el Panel (`00 Panel.md:49,57`), la Guía, el README y CLAUDE.md, pero 7 días en la plantilla de revisión (`Revisión semanal.md:15`) | INCONSISTENCIA | P2 |
| AUD-030 | Los valores permitidos de `estado`, `categoria`, `prioridad`, `clase` y `uso` se repiten en `validar-vault.mjs:9,51`, `Diagnóstico.md:55-59`, las plantillas, el README, CLAUDE.md y la Guía. Cambiar uno exige tocar seis archivos (incumple DRY) | INCONSISTENCIA de diseño | P2 |
| AUD-021 | El Panel no muestra `ultimo_commit` ni distingue "sin actividad de código" de "sin revisión humana" | PARCIAL | P2 |
| — | "Completados recientemente" ordena por `ultima_revision` como si fuera la fecha de finalización; no existe el campo `fecha_fin` | PARCIAL | P3 |
| — | Índice de revisiones: `new Date(file.name)` da `NaN` si el nombre no es `AAAA-MM-DD` | RIESGO · inspección | P3 |
| — | La consulta TASK filtra por `estado` de la página: **válida**. La documentación oficial de Dataview confirma que las tareas heredan los campos de su página | PASS (documentación) | — |
| — | Todas las consultas DQL y DataviewJS, en una instancia real de Obsidian | HIPÓTESIS · NOT RUN | — |
| — | Uso en móvil: `escanear.bat` es solo para Windows; `agenda.js` en móvil depende de `requestUrl` | HIPÓTESIS · NOT RUN | — |
| — | El plugin *Bases* (núcleo) está activado (`core-plugins.json`) pero no se usa | Oportunidad | — |

---

## 6. Calidad de software

| ID | Hallazgo | Tipo | Prioridad |
|---|---|---|---|
| AUD-033 | CI: sin bloque `permissions:` (el token tiene los permisos por defecto), acciones fijadas por etiqueta y no por SHA, y solo se ejecuta en `ubuntu-latest`, aunque el escáner está pensado para Windows (rutas, `.bat`, mayúsculas) | RIESGO | P2 |
| AUD-034 | Full Calendar 0.10.7: según Obsidian Stats se publicó el 2023-04-06 y es la última versión del repositorio original, que hoy está en una organización de archivo; existe un fork "Remastered". La agenda depende del formato de su `data.json`. *Fecha y estado tomados de fuentes secundarias; no verificados con la API de GitHub* | RIESGO | P2 |
| AUD-035 | Plugins de terceros incluidos en Git (≈ 5,7 MB): cada actualización desde Obsidian añade varios MB al historial. Las licencias MIT de los plugins no se acompañan de su archivo `LICENSE` | RIESGO | P3 |
| AUD-039 | Huecos de prueba: BOM/CRLF/espacios iniciales, colisiones de nombre, `actualizarHerramienta` con origen previo, Windows, consultas del Panel, `Diagnóstico.md` y el render de `agenda.js` (66 % de cobertura) | PARCIAL | P1 (asociado a P0/P1) |
| AUD-040 | Sin linter ni comprobación estática de tipos (JS sin JSDoc ni `checkJs`) | AUSENTE | P3 |
| — | Dependencias: el código propio no tiene ninguna dependencia npm, así que no hay superficie de vulnerabilidades de terceros. Instalación reproducible (solo Node) | PASS | — |
| — | Secretos: la URL iCal está excluida (`.gitignore:2`) y no hay credenciales en el repo (revisión manual de los archivos versionados) | PASS | — |

---

## 7. Inconsistencias documentales

| ID | Documento | Afirma | Realidad |
|---|---|---|---|
| AUD-027 | `ROADMAP.md:61,164` (Fases 2 y 4) | Actualizar `ultimo_push` con una GitHub Action | El campo es `ultimo_commit`, no `ultimo_push`. Además, las notas están en `.gitignore`, así que una Action **no puede** actualizarlas. El diseño de la Fase 4 quedó obsoleto con el cambio a "repo solo con el sistema" |
| AUD-028 | `README.md:61` | "copia de seguridad sin pensar en ello" | Falso para `01 Proyectos/` y `05 Herramientas/` (AUD-003) |
| AUD-028 | `README.md:55` | "Soporta eventos recurrentes, excepciones y zonas horarias" | Parcial (AUD-011 a AUD-018) |
| AUD-028 | `README.md:199` | Node 18 o superior | El código necesita ≥ 17. Coherente, pero nada lo comprueba (AUD-032) |
| AUD-029 | Panel/Guía frente a plantilla | 14 días frente a 7 días | — |

---

## 8. Resumen de evidencia

- **Defectos confirmados por ejecución:** AUD-001, 002, 005, 010, 011, 012, 013, 014, 015, 016, 017, 020, 022.
- **Defectos confirmados por inspección:** AUD-018, 023 (lógica), 024, 031, 032.
- **Riesgos:** AUD-003, 006, 025, 026, 033, 034, 035.
- **Inconsistencias:** AUD-004, 027, 028, 029, 030.
- **Pendiente de entorno real (NOT RUN):** consultas Dataview en Obsidian, `requestUrl`, caché de `localStorage`, comportamiento en Windows (rutas, mayúsculas, `.bat`) y uso en móvil.
