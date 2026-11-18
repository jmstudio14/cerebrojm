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
- [x] 15 proyectos importados de GitHub (estado deducido, etiqueta `revisar`)
- [x] Índices por carpeta, [[Guía rápida]] y primera revisión

## 🔄 Fase 1: Adopción (ahora)
- [ ] Clonar en el PC Windows (fuera de OneDrive) y abrir como vault
- [ ] Activar los plugins y abrir [[Diagnóstico]]: todo en ✅ (en especial `requestUrl` y la descarga del calendario)
- [ ] Comprobar que el Panel y los índices se ven sin errores
- [ ] Conectar Google Calendar (dirección secreta iCal) y ver los eventos en la agenda
- [ ] Primera revisión: dejar **máximo 3-4 activos**, cada uno con una próxima acción real, y quitar `revisar` (hasta entonces salen en *Necesitan atención*, es intencionado)
- [ ] Usarlo 2 semanas: nota diaria cuando aporte y revisión semanal sin falta
- [ ] Sustituir el esquema del Panel del README (`_sistema/assets/panel-esquema.svg`) por una captura real

**Terminado si:** hay 2 revisiones semanales hechas, ningún proyecto tiene la etiqueta `revisar` y el Panel refleja lo que de verdad estás haciendo.

**Qué apuntar durante la fase** (decide si las Fases 2 y 3 hacen falta):
- ¿Se me olvida actualizar `ultima_revision` o `progreso`?
- ¿Echo en falta ver el estado de los repos (último push, issues) sin abrir GitHub?
- ¿Abro el Panel a diario, o solo en la revisión?
- ¿Qué echo en falta del Panel de Obsidian? (vistas, rapidez, edición, aspecto). Esta lista es la entrada de la Fase 2.

## Fase 2: Interfaz de escritorio
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
- **Tauri 2 + React + TypeScript (estricto) + Vite**. Es el mismo stack que [proyecto privado], así que se reutiliza la experiencia y el tooling.
- Parser de frontmatter YAML y Markdown en TypeScript; el lector iCal se porta desde `_sistema/scripts/agenda.js` a un módulo TypeScript con tests (recurrencias, EXDATE, zonas horarias).
- La URL iCal se lee del mismo `data.json` local de Full Calendar: **sigue sin subirse a Git**.
- Repositorio propio (propuesta: `cerebrojm-app`); el vault solo lo enlaza. *Se decide al empezar la fase.*

### 2a · Sistema de diseño
- [ ] **Tokens**:
  - espaciado en escala 4/8;
  - tipografía: Inter o Geist para la interfaz, una monoespaciada para fechas y cifras, escala modular y pesos limitados (400/500/600);
  - paleta neutra (grises fríos) con **un solo color de acento** y colores semánticos de estado (activo, bloqueado, pausado, idea, completado, archivado);
  - radios, elevación (2-3 niveles de sombra) y bordes;
  - tema claro y oscuro desde el primer día.
- [ ] **Movimiento**: transiciones cortas (150-250 ms) con curvas definidas; respetar `prefers-reduced-motion`.
- [ ] **Componentes** con todos sus estados (normal, hover, foco, activo, deshabilitado): tarjeta, KPI, barra de progreso, chip de estado y prioridad, tabla, columna Kanban, línea de agenda, campo de formulario, menú, diálogo, *toast* y paleta de comandos.
- [ ] **Estados de pantalla**: vacío (con una acción sugerida), cargando (*skeletons*, no spinners), error (con causa y cómo arreglarlo).
- [ ] **Prototipo de alta fidelidad** de todas las pantallas, en claro y oscuro, **antes de escribir código**.

**Terminado si:** tokens y componentes documentados en `docs/DESIGN.md` del repo de la app y prototipos revisados y aprobados.

### 2b · Pantallas
- [ ] **Inicio**: KPIs por estado, foco del día (máx. 3), alertas (vencidos, bloqueados, estancados, sin próxima acción) y la agenda de hoy y mañana.
- [ ] **Proyectos**: vista lista y vista **Kanban por estado**, con filtros por categoría y prioridad y orden configurable.
- [ ] **Detalle de proyecto**: frontmatter editable con controles adecuados (selectores, deslizador de progreso, selector de fecha), tareas marcables y registro.
- [ ] **Agenda**: vistas de semana y de día, con los eventos de Google Calendar y las fechas límite de los proyectos.
- [ ] **Revisión semanal guiada**: asistente paso a paso que genera la nota en `04 Revisiones/`.
- [ ] **Ajustes**: ruta del vault, tema e inicio con Windows.

### 2c · Interacción
- [ ] Paleta de comandos `Ctrl+K` para todo: ir a, crear, cambiar de estado, buscar.
- [ ] Atajos de teclado para todas las acciones frecuentes, con una chuleta en `?`.
- [ ] Búsqueda global en proyectos, notas y tareas.
- [ ] Arrastrar tarjetas entre columnas del Kanban para cambiar `estado`, también con alternativa de teclado.
- [ ] Actualización en vivo: si cambias algo en Obsidian, la app lo refleja al instante (*file watcher*).

### 2d · Escritura segura
- [ ] Editar **solo** campos del frontmatter y casillas `- [ ]`, preservando el resto del archivo **byte a byte**: formato, comentarios y orden.
- [ ] Escritura atómica (archivo temporal y renombrado); nunca dejar un `.md` a medias.
- [ ] No tocar `.obsidian/`.
- [ ] Convivencia con Obsidian Git: detectar cambios externos antes de guardar y no pisar ediciones ajenas.
- [ ] Tests de ida y vuelta: leer, escribir y releer da exactamente el mismo archivo salvo el campo editado.

### 2e · Calidad y entrega
- [ ] **Accesibilidad WCAG 2.1 AA**: contraste, foco siempre visible, objetivos de 44 px o más, navegable con teclado y compatible con lector de pantalla.
- [ ] **Rendimiento**: arranque en frío por debajo de 1,5 s, interacción fluida a 60 fps y un vault de 500 notas sin retrasos perceptibles.
- [ ] **Tests**: unitarios (parser, iCal, escritura segura) y e2e con Playwright de los flujos principales.
- [ ] **Entrega**: instalador de Windows (MSI o NSIS), icono y marca propios, bandeja del sistema e inicio opcional con Windows.
- [ ] Capturas reales de la app en el README del vault.

**Terminado si:** usas la app a diario durante 2 semanas en lugar del Panel de Obsidian, sin perder datos ni crear conflictos de Git, y cumple todos los criterios de 2e.

**Riesgos:**
- Es un segundo sistema que mantener.
- Si la app llegara a guardar estado propio, Obsidian y la app mostrarían datos distintos: por eso el primer principio.
- Es la fase de mayor coste en tiempo: por eso la condición de entrada.

## Fase 3: Estado de los repos automático
Solo si en la Fase 1 queda claro que mantenerlo a mano es el problema.
- [ ] Script (GitHub Action programada o PowerShell local) que actualice `ultimo_push` y los issues abiertos en el frontmatter de cada proyecto con `repo`
- [ ] Alerta en el Panel: proyecto `activo` sin push en más de 30 días
- [ ] Decidir cómo convive con Obsidian Git sin conflictos (que el Action haga commit solo de ese campo)

**Terminado si:** el campo se actualiza solo durante una semana sin conflictos de Git.

## Fase 4: Proyectos personales y creativos
- [ ] Dar de alta los proyectos que no están en GitHub (`categoria: personal` o `creativo`)
- [ ] Revisar si la plantilla les sirve o necesitan otros campos (por ejemplo, `entregable`)

**Terminado si:** todo proyecto en marcha, con código o sin él, tiene su nota.

## Fase 5: Móvil (opcional)
- [ ] Decidir entre Obsidian Git en el móvil (gratis, más frágil) y Obsidian Sync (de pago, fiable) según el uso real
- [ ] Probar a capturar en la [[Bandeja de entrada]] desde el móvil

**Terminado si:** puedes capturar una idea en el móvil y aparece en el PC sin tocar nada.

---

## Ideas sin priorizar
- Importar los `ROADMAP.md` de los repos ([proyecto privado], [proyecto privado], [proyecto privado], [proyecto privado], [proyecto privado]) a *Próximas tareas* de cada proyecto
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
