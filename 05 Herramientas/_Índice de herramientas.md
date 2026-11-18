---
tipo: indice
---

# Índice de herramientas

Skills, agentes, plugins y MCP que uso con Claude. Nueva: crea una nota aquí y aplica la plantilla **Herramienta**.

```dataviewjs
const hs = dv.pages('"05 Herramientas"').where(h => h.tipo === "herramienta");
const CLASES = [["skill", "🧩 Skills"], ["mcp", "🔌 Servidores MCP"], ["plugin", "📦 Plugins"], ["agente", "🤖 Agentes"]];
const USO = { frecuente: 1, ocasional: 2, probando: 3, descartada: 9 };
const estrellas = v => v ? "★".repeat(v) + "☆".repeat(5 - v) : "—";
const origen = h => h.origen ? `[enlace](${h.origen})` : "por confirmar";
dv.paragraph(`**${hs.length}** herramientas · ` + CLASES.map(([c, t]) => `${t.split(" ")[0]} ${hs.where(h => h.clase === c).length}`).join(" · "));
for (const [clase, titulo] of CLASES) {
  const grupo = hs.where(h => h.clase === clase)
    .sort(h => [USO[h.uso] ?? 5, -(h.uso_en || []).length, h.file.name])
    .array();
  if (!grupo.length) continue;
  dv.header(2, titulo);
  dv.table(["Herramienta", "Uso", "Valoración", "Proyectos", "Origen"],
    grupo.map(h => [h.file.link, h.uso ?? "—", estrellas(h.valoracion), (h.uso_en || []).length, origen(h)]));
}
```

## Pendientes de revisar
```dataview
LIST
FROM "05 Herramientas"
WHERE tipo = "herramienta" AND contains(etiquetas, "revisar")
SORT file.name ASC
```
