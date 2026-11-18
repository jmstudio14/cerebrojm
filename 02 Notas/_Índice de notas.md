---
tipo: indice
---

# Índice de notas

Notas sueltas e ideas. La [[Bandeja de entrada]] se vacía en cada revisión semanal: cada nota va a un proyecto, se archiva o se borra.

```dataview
TABLE WITHOUT ID file.link AS "Nota", proyecto AS "Proyecto", file.mtime AS "Modificada"
FROM "02 Notas"
WHERE tipo != "indice"
SORT file.mtime DESC
```

## Notas sin proyecto
```dataview
LIST
FROM "02 Notas"
WHERE tipo = "nota" AND !proyecto AND file.name != "Bandeja de entrada"
```
