---
tipo: roadmap
actualizado: 2026-11-18
---

# Roadmap del cerebro digital

Evolución del **sistema**, no de tus proyectos (el estado de cada proyecto está en su nota y en el [[00 Panel|Panel]]).

**Regla:** no se empieza una fase hasta cerrar la anterior. Nada de la Fase 2 en adelante hasta terminar la Fase 1. Un sistema que no se usa no necesita más funciones.

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
- [ ] Activar los plugins y comprobar que el Panel y los índices se ven sin errores
- [ ] Conectar Google Calendar (dirección secreta iCal) y ver los eventos en la agenda
- [ ] Primera revisión: dejar **máximo 3-4 activos**, cada uno con una próxima acción real, y quitar `revisar`
- [ ] Usarlo 2 semanas: nota diaria cuando aporte y revisión semanal sin falta
- [ ] Sustituir el esquema del Panel del README (`_sistema/assets/panel-esquema.svg`) por una captura real

**Terminado si:** hay 2 revisiones semanales hechas, ningún proyecto tiene la etiqueta `revisar` y el Panel refleja lo que de verdad estás haciendo.

**Qué apuntar durante la fase** (decide si la Fase 2 hace falta):
- ¿Se me olvida actualizar `ultima_revision` o `progreso`?
- ¿Echo en falta ver el estado de los repos (último push, issues) sin abrir GitHub?
- ¿Abro el Panel a diario, o solo en la revisión?

## Fase 2: Estado de los repos automático
Solo si en la Fase 1 queda claro que mantenerlo a mano es el problema.
- [ ] Script (GitHub Action programada o PowerShell local) que actualice `ultimo_push` y los issues abiertos en el frontmatter de cada proyecto con `repo`
- [ ] Alerta en el Panel: proyecto `activo` sin push en más de 30 días
- [ ] Decidir cómo convive con Obsidian Git sin conflictos (que el Action haga commit solo de ese campo)

**Terminado si:** el campo se actualiza solo durante una semana sin conflictos de Git.

## Fase 3: Proyectos personales y creativos
- [ ] Dar de alta los proyectos que no están en GitHub (`categoria: personal` o `creativo`)
- [ ] Revisar si la plantilla les sirve o necesitan otros campos (por ejemplo, `entregable`)

**Terminado si:** todo proyecto en marcha, con código o sin él, tiene su nota.

## Fase 4: Móvil (opcional)
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
