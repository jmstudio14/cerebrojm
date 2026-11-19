---
tipo: roadmap
actualizado: 2026-11-18
---

# Roadmap del cerebro digital

Evolución del **sistema**, no de tus proyectos (el estado de cada proyecto está en su nota y en el [[00 Panel|Panel]]).

**Regla:** no se empieza una fase hasta cerrar la anterior. Nada de la Fase 2 en adelante hasta terminar la Fase 1. Un sistema que no se usa no necesita más funciones.

**Congelación:** hasta cerrar la Fase 1, el sistema (Panel, plantillas, scripts, README, roadmap) **no se toca**, salvo para corregir fallos encontrados al usarlo. Las ideas nuevas se apuntan en *Ideas sin priorizar*.

---

## ✅ Fase 0: Base (hecha, 2026-11-18)
- [x] Vault de Obsidian en GitHub con Obsidian Git (pull al abrir, commit y push cada 10 min)
- [x] Panel: estados, alertas (vencidos, bloqueados, estancados, sin próxima acción), tareas y agenda
- [x] Google Calendar en solo lectura: Full Calendar y `agenda.js` (la URL iCal fuera de Git)
- [x] Plantillas: proyecto, nota diaria, revisión semanal y nota
- [x] Escáner de proyectos y herramientas (`escanear.bat`): los datos se generan en el PC y no se suben al repo
- [x] Índices por carpeta, [[Guía rápida]], [[Diagnóstico]], tests y CI

## 🔄 Fase 1: Adopción (ahora)
- [x] Clonar en el PC Windows (fuera de OneDrive) y abrir como vault
- [x] Instalar Node.js si no lo tienes y ejecutar `escanear.bat` con tus carpetas de proyectos
- [x] Activar los plugins y abrir [[Diagnóstico]]: todo en ✅ (en especial `requestUrl` y la descarga del calendario)
- [x] Comprobar que el Panel y los índices se ven sin errores
- [x] Conectar Google Calendar (dirección secreta iCal) y ver los eventos en la agenda
- [x] Primera revisión (nota nueva en `04 Revisiones/` con la plantilla): dejar **máximo 3-4 activos**, cada uno con una próxima acción real, y quitar `revisar` (hasta entonces salen en *Necesitan atención*, es intencionado)
- [ ] Usarlo 2 semanas: nota diaria cuando aporte y revisión semanal sin falta
- [x] Sustituir el esquema del Panel del README (`_sistema/assets/panel-esquema.svg`) por una captura real

**Terminado si:** hay 2 revisiones semanales hechas, ningún proyecto tiene la etiqueta `revisar` y el Panel refleja lo que de verdad estás haciendo.

**Qué apuntar durante la fase** (decide qué fases posteriores hacen falta):
- ¿Se me olvida actualizar `ultima_revision` o `progreso`?
- ¿Echo en falta ver el estado de los repos (último push, issues) sin abrir GitHub?
- ¿Abro el Panel a diario, o solo en la revisión?
- ¿Qué tareas repetitivas de mis proyectos le pediría a un agente? (revisar estado, preparar la revisión, ejecutar la siguiente fase de un repo). Esta lista es la entrada de la Fase 2.
- ¿Qué echo en falta del Panel de Obsidian? (vistas, rapidez, edición, aspecto). Esta lista es la entrada de la Fase 3.

## Fase 2: Agente de proyectos (Claude Code)
Un agente de Claude Code que, desde este vault, **gestiona tus proyectos** y **ejecuta la siguiente fase del roadmap de cualquiera de tus repos**, terminando siempre en un PR que revisas y fusionas tú.

### Condición de entrada
- [ ] Fase 1 cerrada: 3-4 proyectos activos con próxima acción real y ninguno con `revisar`. El agente debe trabajar sobre datos fiables, no sobre los importados.
- [ ] Lista de tareas repetitivas que delegarías, sacada de la Fase 1.

### Principios no negociables
- **Las reglas de cada repo mandan.** El agente lee y obedece el `CLAUDE.md` del repo en el que trabaja, aunque contradiga sus propias costumbres. Ejemplos típicos: un repo que prohíbe `git push` sin permiso, otro que no deja avanzar de fase si fallan los tests obligatorios, otro que exige actualizar su ROADMAP o uno sin tests.
- **Rama y PR, siempre.** Nunca fusiona, nunca hace push a `main` ni reescribe historial. Tú decides qué entra.
- **Plan antes que código.** Toda fase empieza en modo plan y espera tu aprobación.
- **Sin verificación no hay fase terminada.** Ejecuta los tests y el lint del repo. Si el repo no tiene, lo dice y propone cómo verificar antes de seguir.
- **No inventa datos.** Lo que no puede comprobar lo marca como «por confirmar».
- **El vault es la memoria.** Cada acción deja rastro en la nota del proyecto: `## Registro`, `progreso`, `proxima_accion` y enlace al PR.

### 2a · Gestión desde el vault (sin tocar otros repos)
- [x] Reutilizar `_sistema/scripts/escanear.mjs` como fuente de datos del agente (ya conoce carpetas, repos, ROADMAP, CLAUDE.md y tests de cada proyecto).
- [x] Subagente `.claude/agents/gestor-proyectos.md`: lee el vault y edita solo `01 Proyectos/`, `04 Revisiones/` y `05 Herramientas/`.
- [x] `/estado`: resumen por estado con vencidos, bloqueados, estancados y sin próxima acción. Actualiza `ultimo_push` consultando GitHub y lista los PRs abiertos pendientes de revisión.
- [x] `/revision`: crea `04 Revisiones/AAAA-MM-DD.md` desde la plantilla con datos reales.
- [x] `/proyecto <nombre>`: ficha del proyecto, últimos cambios en su repo y una propuesta de siguiente paso.

**Terminado si:** `/estado` coincide con el [[00 Panel|Panel]] y `/revision` genera una nota que pasa `validar-vault.mjs`.

### 2b · Leer y planificar la fase siguiente de un repo
- [x] `/fase <proyecto>`: localiza el repo (campo `repo`), lee su `ROADMAP.md`, `CLAUDE.md` y su estado (tests, CI, ramas abiertas), identifica la **fase siguiente** y propone un plan con tareas, archivos afectados, riesgos y cómo se verificará.
- [x] No escribe código. Si el repo no tiene ROADMAP, propone uno a partir del README y del código.

**Terminado si:** en 2 repos reales el plan propuesto es correcto, identifica bien la fase y respeta las reglas de su `CLAUDE.md`.

### 2c · Implementar la fase
- [x] Con el plan aprobado: rama nueva, implementación paso a paso, tests y lint del propio repo, y actualización de su ROADMAP o CHANGELOG si sus reglas lo piden.
- [x] PR en borrador con resumen, verificación ejecutada y riesgos pendientes.
- [x] En el vault: actualizar `progreso`, `proxima_accion`, una línea de Registro y el enlace al PR.

**Terminado si:** una fase real queda implementada en un repo, con su CI en verde y el PR **revisado y fusionado por ti**.

### 2d · Seguimiento
- [x] Vigilar los PRs abiertos (CI y comentarios) y corregir lo que pidan las revisiones, sin fusionar nunca.
- [x] Reflejar en el vault cuándo se fusiona un PR y cuál es la siguiente fase.

**Terminado si:** durante 2 semanas el agente gestiona al menos 2 fases en repos distintos sin romper nada y sin que tengas que corregir el vault a mano.

**Riesgos:**
- Repos con pocos tests: un cambio "correcto" puede romper algo sin aviso. Por eso el plan va primero y todo pasa por PR.
- Coste en repos grandes (muchas skills, ETL o monorepos): acotar el contexto a la fase.
- Escrituras en el vault mientras Obsidian Git sincroniza: `git pull` antes y commits pequeños.
- Delegar el criterio: el agente propone y ejecuta, pero las decisiones de producto son tuyas.

## Fase 3: Interfaz de escritorio
App de escritorio para Windows, **minimalista, profesional y cuidada al detalle**, que muestra y edita el cerebro digital sin abrir Obsidian. No es un tema ni un retoque: es un producto con su propio sistema de diseño.

### Condición de entrada (go / no-go)
- [ ] Fase 1 cerrada.
- [ ] Lista escrita de lo que le falta al Panel de Obsidian, sacada de la Fase 1.
- [ ] Decisión explícita: **construir** o **aplazar** (y por qué). Si el Panel de Obsidian ya basta, esta fase se aplaza: es la más cara del roadmap.

### Principios no negociables
- Los `.md` del vault son la **única fuente de verdad**. La app no tiene base de datos propia ni guarda copia de los datos: lee y escribe los mismos archivos que Obsidian.
- **Complementa a Obsidian, no lo sustituye**: vista y edición rápida del día a día; la escritura larga sigue en Obsidian.
- **Local y sin conexión**: funciona sin internet, salvo la agenda, que muestra la última versión descargada.
- **Minimalismo con criterio**: cada elemento justifica su sitio; la jerarquía la marcan la tipografía, el espacio y un único color de acento, no los adornos.

### Stack
- **Tauri 2 + React + TypeScript (estricto) + Vite**. Stack conocido y maduro para apps de escritorio ligeras.
- Parser de frontmatter YAML y Markdown en TypeScript; el lector iCal se porta desde `_sistema/scripts/agenda.js` a un módulo TypeScript con tests (recurrencias, EXDATE, zonas horarias).
- La URL iCal se lee del mismo `data.json` local de Full Calendar: **sigue sin subirse a Git**.
- Repositorio propio (propuesta: `cerebrojm-app`); el vault solo lo enlaza. *Se decide al empezar la fase.*

### 3a · Sistema de diseño
- [x] **Tokens**:
  - espaciado en escala 4/8;
  - tipografía: Inter o Geist para la interfaz, una monoespaciada para fechas y cifras, escala modular y pesos limitados (400/500/600);
  - paleta neutra (grises fríos) con **un solo color de acento** y colores semánticos de estado (activo, bloqueado, pausado, idea, completado, archivado);
  - radios, elevación (2-3 niveles de sombra) y bordes;
  - tema claro y oscuro desde el primer día.
- [x] **Movimiento**: transiciones cortas (150-250 ms) con curvas definidas; respetar `prefers-reduced-motion`.
- [x] **Componentes** con todos sus estados (normal, hover, foco, activo, deshabilitado): tarjeta, KPI, barra de progreso, chip de estado y prioridad, tabla, columna Kanban, línea de agenda, campo de formulario, menú, diálogo, *toast* y paleta de comandos.
- [x] **Estados de pantalla**: vacío (con una acción sugerida), cargando (*skeletons*, no spinners), error (con causa y cómo arreglarlo).
- [x] **Prototipo de alta fidelidad** de todas las pantallas, en claro y oscuro, **antes de escribir código**.

**Terminado si:** tokens y componentes documentados en `docs/DESIGN.md` del repo de la app y prototipos revisados y aprobados.

### 3b · Pantallas
- [x] **Inicio**: KPIs por estado, foco del día (máx. 3), alertas (vencidos, bloqueados, estancados, sin próxima acción) y la agenda de hoy y mañana.
- [x] **Proyectos**: vista lista y vista **Kanban por estado**, con filtros por categoría y prioridad y orden configurable.
- [x] **Detalle de proyecto**: frontmatter editable con controles adecuados (selectores, deslizador de progreso, selector de fecha), tareas marcables y registro.
- [x] **Agenda**: vistas de semana y de día, con los eventos de Google Calendar y las fechas límite de los proyectos.
- [x] **Revisión semanal guiada**: asistente paso a paso que genera la nota en `04 Revisiones/`.
- [x] **Ajustes**: ruta del vault, tema e inicio con Windows.

### 3c · Interacción
- [x] Paleta de comandos `Ctrl+K` para todo: ir a, crear, cambiar de estado, buscar.
- [x] Atajos de teclado para todas las acciones frecuentes, con una chuleta en `?`.
- [x] Búsqueda global en proyectos, notas y tareas.
- [x] Arrastrar tarjetas entre columnas del Kanban para cambiar `estado`, también con alternativa de teclado.
- [x] Actualización en vivo: si cambias algo en Obsidian, la app lo refleja al instante (*file watcher*).

### 3d · Escritura segura
- [x] Editar **solo** campos del frontmatter y casillas `- [ ]`, preservando el resto del archivo **byte a byte**: formato, comentarios y orden.
- [x] Escritura atómica (archivo temporal y renombrado); nunca dejar un `.md` a medias.
- [x] No tocar `.obsidian/`.
- [x] Convivencia con Obsidian Git: detectar cambios externos antes de guardar y no pisar ediciones ajenas.
- [x] Tests de ida y vuelta: leer, escribir y releer da exactamente el mismo archivo salvo el campo editado.

### 3e · Calidad y entrega
- [x] **Accesibilidad WCAG 2.1 AA**: contraste, foco siempre visible, objetivos de 44 px o más, navegable con teclado y compatible con lector de pantalla.
- [x] **Rendimiento**: arranque en frío por debajo de 1,5 s, interacción fluida a 60 fps y un vault de 500 notas sin retrasos perceptibles.
- [x] **Tests**: unitarios (parser, iCal, escritura segura) y e2e con Playwright de los flujos principales.
- [x] **Entrega**: instalador de Windows (MSI o NSIS), icono y marca propios, bandeja del sistema e inicio opcional con Windows.
- [x] Capturas reales de la app en el README del vault.

**Terminado si:** usas la app a diario durante 2 semanas en lugar del Panel de Obsidian, sin perder datos ni crear conflictos de Git, y cumple todos los criterios de 2e.

**Riesgos:**
- Es un segundo sistema que mantener.
- Si la app llegara a guardar estado propio, Obsidian y la app mostrarían datos distintos: por eso el primer principio.
- Es la fase de mayor coste en tiempo: por eso la condición de entrada.

## Fase 4: Estado de los repos automático
Solo si en la Fase 1 queda claro que mantenerlo a mano es el problema, y si `/estado` del agente (Fase 2) no lo resuelve ya bajo demanda.
- [ ] Script (GitHub Action programada o PowerShell local) que actualice `ultimo_push` y los issues abiertos en el frontmatter de cada proyecto con `repo`
- [ ] Alerta en el Panel: proyecto `activo` sin push en más de 30 días
- [ ] Decidir cómo convive con Obsidian Git sin conflictos (que el Action haga commit solo de ese campo)

**Terminado si:** el campo se actualiza solo durante una semana sin conflictos de Git.

## Fase 5: Proyectos personales y creativos
- [ ] Dar de alta los proyectos que no están en GitHub (`categoria: personal` o `creativo`)
- [ ] Revisar si la plantilla les sirve o necesitan otros campos (por ejemplo, `entregable`)

**Terminado si:** todo proyecto en marcha, con código o sin él, tiene su nota.

## Fase 6: Móvil (opcional)
- [ ] Decidir entre Obsidian Git en el móvil (gratis, más frágil) y Obsidian Sync (de pago, fiable) según el uso real
- [ ] Probar a capturar en la [[Bandeja de entrada]] desde el móvil

**Terminado si:** puedes capturar una idea en el móvil y aparece en el PC sin tocar nada.

---

## Ideas sin priorizar
- Vistas con **Bases** (núcleo de Obsidian), por ejemplo tarjetas por estado
- **Templater** para crear un proyecto contestando preguntas en vez de editar el frontmatter
- Aviso de proyectos `codigo` sin `repo`
- Calendario bidireccional (crear eventos desde Obsidian): solo con una necesidad clara; exige credenciales OAuth y mantenimiento

## Registro de cambios del sistema
- 2026-11-18: Fase 0 completada (PR #1).
- 2026-11-18: README rediseñado con banner, diagramas y esquema del Panel.
- 2026-11-18: añadida la Fase 2 (interfaz de escritorio); las fases siguientes pasan a 3, 4 y 5.
- 2026-11-18: auditoría: datos importados honestos (las alertas ya no se ocultan), `agenda.js` con `requestUrl` robusto, caché sin conexión y escape de títulos, nota [[Diagnóstico]], tests del iCal, validador de frontmatter y CI. Congelación del sistema hasta cerrar la Fase 1.
- 2026-11-18: quitada la licencia MIT (vault privado, todos los derechos reservados).
- 2026-11-18: catálogo de herramientas (`05 Herramientas/`, 21 fichas generadas desde los repos, plantilla, índice y validación en CI). Excepción a la congelación pedida por el usuario: es contenido nuevo y no toca el Panel ni la agenda.
- 2026-11-18: añadida la Fase 2 (agente de proyectos con Claude Code); la app de escritorio pasa a Fase 3 y el resto se renumera (4 repos automático, 5 personales, 6 móvil).
- 2026-11-18: **el repo pasa a ser solo el cerebro**: se eliminan del repo las notas de proyectos y herramientas, que ahora genera `escanear.bat` en el PC (excluidas de Git); tests del escáner en la CI; documentación con ejemplos genéricos.
- 2026-11-18: ADR-0001 aceptado: notas, diario, revisiones y adjuntos salen de Git; copia cifrada local (`respaldar.bat` / `restaurar.bat`, AES-256-GCM, sin dependencias); el escáner crea la bandeja si falta; commits sin nombre de equipo; test de coherencia de `.gitignore` en CI.
- 2026-11-18: Fase 1: primer escaneo de proyectos en el PC (Node v26, `escaner.local.json` local); `validar-vault.mjs` y tests en verde.
- 2026-11-18: Fase 1: los 34 proyectos pasan a `activo` y pierden `revisar` por decisión del usuario (incumple el máximo de 3-4 activos; sin `proxima_accion` todavía). Primera revisión abierta.
- 2026-11-18: Fase 1: primera revisión hecha. Quedan 4 proyectos activos (OSINEITOR, HARRY POTTER CARDS, Miel y calendario DAM) con una próxima acción tomada de los ROADMAP de sus repos (por confirmar); los otros 30 conservan su estado anterior y ninguno lleva `revisar`. Sustituye al paso de los 34 activos.
- 2026-11-18: Fase 2a implementada por petición expresa con la Fase 1 abierta (condición de entrada sin cumplir): subagente `gestor-proyectos`, comandos `/estado`, `/revision` y `/proyecto`, y `estado.mjs` con test en la CI. Sus pasos están comprobados por separado; falta usarlos como comandos en Claude Code. El «Terminado si» de 2a sigue abierto hasta entonces.
- 2026-11-18: Fase 2b implementada por petición expresa con la Fase 1 abierta: comando `/fase <proyecto>`, de solo lectura. Sus pasos de lectura están comprobados a mano sobre dos repos reales y uno sin ROADMAP; falta ejecutarlo como comando y que el usuario juzgue el plan en 2 repos. El «Terminado si» de 2b sigue abierto.
- 2026-11-18: Fase 2c implementada por petición expresa con la Fase 1 abierta: comando `/implementar <proyecto>` y `.claude/settings.json` con reglas `deny` (merge, `pr ready`, borrar repo, push forzado, push a `main`/`master`, `reset --hard`). Probado de extremo a extremo en un repo privado de prueba (plan aprobado, rama de fase, tests, PR en borrador, nota del vault válida); las 6 órdenes bloqueadas se rechazan. La prueba halló un hueco (`HEAD:main`) y un falso positivo (órdenes encadenadas); el hueco está cerrado. El «Terminado si» de 2c sigue abierto: exige una fase real fusionada por el usuario con CI en verde. 2d no se ha tocado.
- 2026-11-18: Fase 2d (primera mitad) implementada por petición expresa con la Fase 1 abierta: comando `/seguimiento [proyecto]`. Probado en un repo privado de prueba con CI en rojo y un comentario del propietario: corrigió en la misma rama con push normal, respondió con el prefijo `🤖 Seguimiento:`, la CI pasó a verde, el PR siguió en borrador y una segunda pasada no repitió nada. Tras fusionar el usuario el PR, `/seguimiento` anotó «PR #1 fusionado» en el Registro de la nota y el validador pasó; como el ROADMAP del repo de prueba no tenía fase siguiente, `proxima_accion` quedó sin cambios (el camino «propone la siguiente fase» no se ha ejercitado, y la casilla «Reflejar en el vault…» sigue sin marcar por eso). Tampoco se ha probado en vivo el comentario de un tercero. El «Terminado si» de 2d sigue abierto.
- 2026-11-18: Fase 1: el README usa una captura real del Panel (`_sistema/assets/panel.png`, con nombres y acciones de proyecto difuminados) y se elimina `panel-esquema.svg`.
- 2026-11-18: Fase 1: [[Diagnóstico]] en 13/13 ✅ y Panel e índices sin errores de Dataview, comprobado con Obsidian abierto por depuración remota (CDP).
- 2026-11-18: Fase 3a implementada por petición expresa con la Fase 1 abierta y la condición de entrada de la Fase 3 sin cumplir (sin lista de carencias del Panel ni decisión go/no-go escrita). Repo propio `cerebrojm-app`, solo local (sin GitHub ni push): `docs/DESIGN.md` con tokens, movimiento, componentes y estados de pantalla, y prototipo HTML sin dependencias de las 6 pantallas de 3b en claro y oscuro, con datos ficticios. Verificado: test de contraste WCAG AA en los dos temas y 55 comprobaciones en Chrome (todas las pantallas en los dos temas sin errores de consola, `Ctrl+K`, foco visible con Tab, Kanban con ratón y teclado, validación del diálogo, `prefers-reduced-motion`). El «Terminado si» de 3a sigue abierto: falta que revises y apruebes el prototipo. No se ha escrito código de la app (3b-3e).
- 2026-11-19: Fase 3a cerrada: el usuario aprueba el prototipo tal cual. Fase 3b (junto con el núcleo de la escritura segura de 3d) escrita en el repo local `cerebrojm-app` por petición expresa con la Fase 1 abierta. Incluye las 6 pantallas y el diálogo de nuevo proyecto en Tauri 2 + React + TypeScript estricto. La edición solo cambia la línea del campo o la casilla y conserva CRLF/LF. El guardado es atómico, detecta cambios hechos fuera (en Obsidian o por Obsidian Git) y ofrece aplicar solo el cambio propio. Al crear notas nunca sobrescribe, y no escribe en `.obsidian/`. Verificado: 23 tests unitarios (ida y vuelta byte a byte, alertas iguales al Panel, los casos iCal del vault y la revisión), `tsc` estricto, `vite build` y 34 comprobaciones de las pantallas en Chrome con el backend simulado sobre un vault ficticio. **Sin marcar ninguna casilla de 3b ni de 3d**: la parte Rust (comandos de archivo y agenda, con sus tests) no se ha podido compilar porque la instalación de Visual Studio del PC está incompleta (faltan `vcruntime.lib` y cabeceras del Windows SDK), así que la app no se ha arrancado de verdad.
- 2026-11-19: Fase 3c (parte de interfaz) escrita en `cerebrojm-app`:
  - Paleta `Ctrl+K`: ir a, crear, cambiar de estado y buscar proyectos y tareas, sin distinguir tildes.
  - Atajos con chuleta en `?`.
  - Kanban arrastrable y con `Alt+←/→`, siempre con «Deshacer».
  - Verificado en Chrome con el backend simulado: 50 comprobaciones; cada cambio de estado escribe una sola línea.
  - Sin marcar casillas: falta probarlo en la app real, que sigue sin compilar por Visual Studio.
  - Quedan la búsqueda en notas sueltas y el *file watcher*, que necesitan comandos de Rust.
- 2026-11-19: Visual Studio reparado:
  - Se reconstruyó con `msiexec /fv` la caché de dos MSI rotas (.NET Host 9.0.19 y Debug Runtime 14.51), con las MSI oficiales verificadas por firma, ProductCode y PackageCode.
  - Después se repararon VS 2022 y el Windows SDK 22621.
  - Se volvieron a extraer dos crates corruptos en la caché de cargo.
- 2026-11-19: Fase 3 probada en la app real (Tauri, compilada por primera vez) contra una copia del vault ficticio:
  - `cargo test` 8/8.
  - 20 comprobaciones por CDP con escritura real en disco: una línea por cambio, CRLF conservado, sin temporales, conflicto sin pisar, revisión sin sobrescribir.
  - Rust rechaza rutas fuera del vault, en `.obsidian/` y que no son `.md`.
  - Agenda descargada y, sin conexión, desde la caché.
  - Inicio con Windows activado y desactivado.
  - Humo de solo lectura con el vault real: los KPIs coinciden con las notas y Git queda sin cambios.
  - Corregido: los comandos de Rust pasan a `async`, porque una ruta lenta (unidad de red desconectada) congelaba la ventana. Vite deja de vigilar `src-tauri/`.
  - Se marcan las 6 casillas de 3b, 3 de 3c y las 5 de 3d. Quedan la búsqueda en notas, el *file watcher* y 3e.
- 2026-11-19: Fase 3c completa en `cerebrojm-app`:
  - Búsqueda en notas sueltas desde la paleta: comando de Rust `buscar_notas`, sin tildes; omite `.obsidian/`, `_sistema/` y los proyectos.
  - Actualización en vivo con un vigilante (`notify`) sobre `01 Proyectos`.
  - Probado en la app real: un cambio externo se ve en 280 ms sin recargar, un proyecto creado fuera aparece solo y la paleta encuentra notas.
  - `cargo test` 9/9, e2e 51/51 y las 20 comprobaciones de la app real siguen en verde.
- 2026-11-19: Fase 3e completa en `cerebrojm-app`, verificada en la build de release:
  - **Accesibilidad:** axe-core WCAG 2.1 A/AA sin violaciones en las 8 pantallas × 2 temas y en los diálogos. Objetivos de 44 px o más, foco visible en todo el recorrido con Tab y Kanban y paleta manejables con teclado.
    - Se corrigió el nombre accesible de las tarjetas del Kanban (2.5.3) y la altura de la navegación, los controles segmentados y las fechas de la agenda (2.5.5).
    - Lectores de pantalla: el árbol de UI Automation expone 268 controles, todos con nombre. No se ha probado con NVDA ni Narrador manejados por una persona.
  - **Rendimiento** con 500 proyectos: arranque 610 ms (mediana), interacciones de 49 a 70 ms y desplazamientos a 60 fps.
    - La lista pasó de 153 a 70 ms con filas en rejilla y `content-visibility`, sin perder la semántica de tabla.
  - **Tests:** vitest 23, `cargo test` 9, contraste 3, e2e simulado 51 y e2e de la app real 43 (`npm run e2e:app`).
  - **Entrega:**
    - Instalador NSIS para el usuario actual, sin administrador: instala, crea el acceso del menú Inicio y desinstala sin dejar rastro.
    - Bandeja del sistema: el icono se registra en Windows y cerrar la ventana la oculta en la bandeja. El clic en el menú de la bandeja no se ha automatizado.
    - Inicio con Windows: probado en Ajustes.
  - **README del vault:** capturas reales de la app con el vault ficticio (`_sistema/assets/app-*.png`).
  - Corregido además el aviso de `STATIC_VCRUNTIME`: venía del CLI global desfasado (2.11); se usa el CLI del proyecto (`@tauri-apps/cli` 2.12.4).
  - El «Terminado si» de la Fase 3 sigue abierto: exige 2 semanas de uso diario.
- 2026-11-19: Fase 2d (segunda mitad) probada con una fase real. En calendario DAM, `/implementar` hizo la fase 2.4.0 (CI en `windows-latest` con pruebas y `.exe` como artefacto):
  - Rama `fase/2.4.0-ci-windows` con dos commits, CI en verde con 170 pruebas y PR #1 en borrador.
  - El usuario lo revisó y lo fusionó él mismo (commit `0c193f4`). Antes pidió que lo fusionara el agente; se negó por las reglas `deny` de `.claude/settings.json` y por este ROADMAP.
  - El paso de `/seguimiento` anotó «PR #1 fusionado» en la nota y propuso la siguiente fase de su ROADMAP (2.5.0, «(por confirmar)»). Este es el camino que faltaba ejercitar.
  - Se marca la casilla de 2d. Con esto se cumple el «Terminado si» de 2c: una fase real implementada, con CI en verde y el PR revisado y fusionado por el usuario. El de 2d sigue abierto: exige 2 semanas gestionando al menos 2 fases en repos distintos.
