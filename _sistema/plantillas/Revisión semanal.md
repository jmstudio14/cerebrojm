---
tipo: revision
fecha: {{date}}
---

# Revisión semanal — {{date}}

Tiempo objetivo: 30 min. Sin revisión semanal, este sistema se degrada en un mes.

## 1. Proyectos que necesitan atención
```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  estado AS "Estado",
  choice(fecha_limite AND fecha_limite < date(today), "⏰ vencido",
    choice(estado = "bloqueado", "⛔ bloqueado",
    choice(!proxima_accion, "❓ sin próxima acción",
    choice(!ultima_revision OR date(today) - ultima_revision > dur(14 days), "💤 estancado (+14 días)",
    choice(estado = "activo" AND ultimo_push AND date(today) - ultimo_push > dur(30 days), "🧊 sin push (+30 días)",
    "📆 límite cercano"))))) AS "Motivo",
  ultima_revision AS "Última revisión",
  proxima_accion AS "Próxima acción"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND contains(list("activo", "bloqueado"), estado) AND (
  estado = "bloqueado"
  OR !proxima_accion
  OR !ultima_revision OR date(today) - ultima_revision > dur(14 days)
  OR (estado = "activo" AND ultimo_push AND date(today) - ultimo_push > dur(30 days))
  OR (fecha_limite AND fecha_limite - date(today) < dur(14 days))
)
SORT ultima_revision ASC
```

## 2. Checklist
- [ ] Ejecutar `repos.bat` (último push e issues de GitHub) antes de mirar la tabla de arriba
- [ ] Vaciar `02 Notas`: cada nota → proyecto, archivo o borrar
- [ ] Cada proyecto activo tiene **una** próxima acción concreta
- [ ] Actualizar `estado`, `progreso` y `ultima_revision` de lo que toqué
- [ ] ¿Más de 3–4 proyectos activos? Pausar alguno de forma explícita
- [ ] Revisar agenda de la semana que viene
- [ ] Hacer la copia cifrada con `respaldar.bat`

## 3. Agenda próxima semana
```dataviewjs
await dv.view("_sistema/scripts/agenda", { dias: 7 })
```

## 4. Decisiones
- ¿Qué dejo de hacer?
- ¿Qué es lo más importante de la semana?
