---
tipo: revision
fecha: {{date}}
---

# Revisión semanal — {{date}}

Tiempo objetivo: 30 min. Sin revisión semanal, este sistema se degrada en un mes.

## 1. Proyectos que necesitan atención
```dataview
TABLE WITHOUT ID file.link AS "Proyecto", estado, ultima_revision AS "Última revisión", proxima_accion AS "Próxima acción"
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND contains(list("activo","bloqueado"), estado)
  AND (!ultima_revision OR date(today) - ultima_revision > dur(7 days) OR !proxima_accion)
SORT ultima_revision ASC
```

## 2. Checklist
- [ ] Vaciar `02 Notas`: cada nota → proyecto, archivo o borrar
- [ ] Cada proyecto activo tiene **una** próxima acción concreta
- [ ] Actualizar `estado`, `progreso` y `ultima_revision` de lo que toqué
- [ ] ¿Más de 3–4 proyectos activos? Pausar alguno de forma explícita
- [ ] Revisar agenda de la semana que viene

## 3. Agenda próxima semana
```dataviewjs
await dv.view("_sistema/scripts/agenda", { dias: 7 })
```

## 4. Decisiones
- ¿Qué dejo de hacer?
- ¿Qué es lo más importante de la semana?
