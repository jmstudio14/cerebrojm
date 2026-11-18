---
tipo: indice
---

# Índice del diario

Nota de hoy: `Ctrl+P` → *Daily notes: Open today's daily note*.

```dataview
TABLE WITHOUT ID file.link AS "Día", length(filter(file.tasks, (t) => !t.completed)) AS "Tareas abiertas"
FROM "03 Diario"
WHERE tipo = "diario"
SORT file.name DESC
LIMIT 30
```

## Tareas abiertas en notas diarias
```dataview
TASK
FROM "03 Diario"
WHERE !completed AND text != ""
GROUP BY file.link
```
