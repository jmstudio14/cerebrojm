---
tipo: indice
---

# Índice de revisiones

Una revisión por semana (30 min). Crea `04 Revisiones/AAAA-MM-DD.md` con la plantilla **Revisión semanal**.

```dataview
LIST
FROM "04 Revisiones"
WHERE tipo = "revision"
SORT file.name DESC
```

```dataviewjs
const ultima = dv.pages('"04 Revisiones"').where(p => p.tipo === "revision").sort(p => p.file.name, "desc").first();
if (!ultima) dv.paragraph("> [!warning] Todavía no hay ninguna revisión.");
else {
  const dias = Math.floor((Date.now() - new Date(ultima.file.name).getTime()) / 86400000);
  if (dias > 7) dv.paragraph(`> [!warning] Última revisión hace ${dias} días. Toca hacer una.`);
  else dv.paragraph(`Última revisión hace ${dias} días.`);
}
```
