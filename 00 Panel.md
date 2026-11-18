---
tipo: panel
cssclasses: [panel]
---

# 🧠 Panel

```dataviewjs
const ps = dv.pages('"01 Proyectos"').where(p => p.tipo === "proyecto");
const n = e => ps.where(p => p.estado === e).length;
const hoy = dv.date("today");
const vencidos = ps.where(p => p.fecha_limite && p.fecha_limite < hoy && !["completado","archivado"].includes(p.estado)).length;
dv.paragraph(
  `**${n("activo")}** activos · **${n("bloqueado")}** bloqueados · **${n("pausado")}** pausados · ` +
  `**${n("idea")}** ideas · **${n("completado")}** completados` +
  (vencidos ? ` · ⚠️ **${vencidos} vencidos**` : "")
);
if (n("activo") > 5) dv.paragraph("> [!warning] Tienes más de 5 proyectos activos. Probablemente alguno debería estar `pausado`.");
```

## 📅 Agenda (7 días)
```dataviewjs
await dv.view("_sistema/scripts/agenda", { dias: 7 })
```

## 🚀 Activos
```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  categoria AS "Tipo",
  prioridad AS "Prioridad",
  ("<progress value='" + default(progreso, 0) + "' max='100'></progress> " + default(progreso, 0) + "%") AS "Progreso",
  proxima_accion AS "Próxima acción",
  fecha_limite AS "Límite"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND estado = "activo"
SORT choice(prioridad = "alta", 1, choice(prioridad = "media", 2, 3)) ASC, fecha_limite ASC
```

## ⚠️ Necesitan atención
```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  estado AS "Estado",
  choice(fecha_limite AND fecha_limite < date(today), "⏰ vencido",
    choice(estado = "bloqueado", "⛔ bloqueado",
    choice(!proxima_accion, "❓ sin próxima acción",
    choice(!ultima_revision OR date(today) - ultima_revision > dur(14 days), "💤 estancado (+14 días)",
    "📆 límite cercano")))) AS "Motivo",
  ultima_revision AS "Últ. revisión",
  fecha_limite AS "Límite"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND contains(list("activo", "bloqueado"), estado) AND (
  estado = "bloqueado"
  OR !proxima_accion
  OR !ultima_revision OR date(today) - ultima_revision > dur(14 days)
  OR (fecha_limite AND fecha_limite - date(today) < dur(14 days))
)
SORT fecha_limite ASC
```

## ✅ Tareas abiertas de proyectos activos
```dataview
TASK
FROM "01 Proyectos"
WHERE !completed AND text != "" AND meta(section).subpath = "Próximas tareas"
  AND contains(list("activo", "bloqueado"), estado)
GROUP BY file.link
```

## 💻 Proyectos de código
```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  estado AS "Estado",
  ("<progress value='" + default(progreso, 0) + "' max='100'></progress>") AS "Progreso",
  choice(repo, "[repo](" + repo + ")", "—") AS "Repo",
  ultima_revision AS "Últ. revisión"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND categoria = "codigo" AND !contains(list("completado", "archivado"), estado)
SORT choice(estado = "activo", 1, choice(estado = "bloqueado", 2, choice(estado = "pausado", 3, 4))) ASC
```

## 🎨 Proyectos personales / creativos
```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  estado AS "Estado",
  ("<progress value='" + default(progreso, 0) + "' max='100'></progress>") AS "Progreso",
  ultima_revision AS "Últ. revisión"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND categoria != "codigo" AND !contains(list("completado", "archivado"), estado)
SORT choice(estado = "activo", 1, choice(estado = "bloqueado", 2, choice(estado = "pausado", 3, 4))) ASC
```

## 💡 Ideas y pausados
```dataview
LIST "*" + estado + "*" + choice(proxima_accion, " — " + proxima_accion, "")
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND contains(list("idea", "pausado"), estado)
SORT estado ASC, file.mtime DESC
```

## 🏁 Completados recientemente
```dataview
LIST "completado · " + dateformat(ultima_revision, "dd/MM/yyyy")
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND estado = "completado"
SORT ultima_revision DESC
LIMIT 5
```

---
Atajos: [[_sistema/plantillas/Proyecto|Plantilla de proyecto]] · [[_sistema/plantillas/Revisión semanal|Revisión semanal]] · Calendario completo: paleta de comandos → *Full Calendar: Open Calendar*
