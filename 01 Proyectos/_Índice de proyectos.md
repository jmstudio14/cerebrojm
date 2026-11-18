---
tipo: indice
---

# Índice de proyectos

Vuelve al [[00 Panel|Panel]] · Nuevo proyecto: crea una nota aquí y aplica la plantilla **Proyecto**.

## Por estado
```dataview
TABLE WITHOUT ID key AS "Estado", length(rows) AS "Nº", rows.file.link AS "Proyectos"
FROM "01 Proyectos"
WHERE tipo = "proyecto"
SORT file.name ASC
GROUP BY estado
SORT choice(key = "activo", 1, choice(key = "bloqueado", 2, choice(key = "pausado", 3, choice(key = "idea", 4, choice(key = "completado", 5, 6))))) ASC
```

## Pendientes de confirmar (etiqueta `revisar`)
```dataview
LIST
FROM "01 Proyectos"
WHERE tipo = "proyecto" AND contains(etiquetas, "revisar")
SORT file.name ASC
```
