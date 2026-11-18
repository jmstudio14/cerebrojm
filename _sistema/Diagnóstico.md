---
tipo: sistema
---

# Diagnóstico

Ábrela después de clonar o si algo del [[00 Panel|Panel]] no se ve bien. Todo debería salir en ✅.

```dataviewjs
const filas = [];
const ok = (nombre, bien, detalle = "") => filas.push([bien === null ? "⚪" : bien ? "✅" : "❌", nombre, detalle]);

// 1. Plugins
const plugins = app.plugins.enabledPlugins;
for (const [id, nombre] of [["dataview", "Dataview"], ["obsidian-git", "Obsidian Git"], ["obsidian-full-calendar", "Full Calendar"]]) {
  ok(`Plugin ${nombre}`, plugins.has(id), plugins.has(id) ? "activado" : "Ajustes → Community plugins → actívalo");
}
ok("DataviewJS", true, "si lees esta tabla, funciona");

// 2. requestUrl (necesario para descargar Google Calendar sin bloqueo CORS)
let req = null;
if (typeof globalThis.requestUrl === "function") req = globalThis.requestUrl;
else { try { req = require("obsidian").requestUrl; } catch (e) {} }
ok("requestUrl de Obsidian", typeof req === "function", typeof req === "function" ? "disponible" : "no disponible: la agenda no podrá descargar calendarios");

// 3. Calendarios
let fuentes = [];
try {
  const cfg = JSON.parse(await app.vault.adapter.read(".obsidian/plugins/obsidian-full-calendar/data.json"));
  fuentes = (cfg.calendarSources || []).filter((s) => s.type === "ical" && s.url);
} catch (e) {}
ok("Calendarios iCal configurados", fuentes.length > 0 ? true : null, fuentes.length ? `${fuentes.length}` : "ninguno todavía (README, paso 4)");
for (const [i, f] of fuentes.entries()) {
  try {
    const r = await req({ url: f.url.replace(/^webcal:/i, "https:") });
    const n = (r.text.match(/BEGIN:VEVENT/g) || []).length;
    ok(`Descarga del calendario ${i + 1}`, /BEGIN:VCALENDAR/.test(r.text), `${n} eventos en el archivo`);
  } catch (e) {
    ok(`Descarga del calendario ${i + 1}`, false, String(e.message || e));
  }
}

// 4. Git
const gitIgnora = (await app.vault.adapter.read(".gitignore").catch(() => "")).includes("obsidian-full-calendar/data.json");
ok("URL del calendario fuera de Git", gitIgnora, gitIgnora ? ".gitignore correcto" : "¡añade la línea a .gitignore!");

// 5. Escáner
let cfg = null;
try { cfg = JSON.parse(await app.vault.adapter.read("_sistema/config/escaner.local.json")); } catch (e) {}
ok("Escáner configurado", cfg?.carpetas?.length ? true : null, cfg?.carpetas?.length ? cfg.carpetas.join(" · ") : "aún no: ejecuta escanear.bat");
const ultimoEscaneo = dv.pages('"01 Proyectos"').where((p) => p.escaneado).array().map((p) => String(p.escaneado).slice(0, 10)).sort().pop();
if (ultimoEscaneo) ok("Último escaneo", true, ultimoEscaneo);

// 6. Proyectos
const PERM = {
  categoria: ["codigo", "personal", "creativo"],
  estado: ["idea", "activo", "pausado", "bloqueado", "completado", "archivado"],
  prioridad: ["alta", "media", "baja"],
};
const ps = dv.pages('"01 Proyectos"').where((p) => p.tipo === "proyecto");
const malos = [];
for (const p of ps) {
  for (const [k, vals] of Object.entries(PERM)) if (!vals.includes(p[k])) malos.push(`${p.file.name}: ${k} = ${p[k] ?? "(vacío)"}`);
  if (typeof p.progreso !== "number" || p.progreso < 0 || p.progreso > 100) malos.push(`${p.file.name}: progreso = ${p.progreso ?? "(vacío)"}`);
}
ok(`Frontmatter de ${ps.length} proyectos`, ps.length === 0 ? null : malos.length === 0, ps.length === 0 ? "todavía no hay proyectos (escanear.bat)" : malos.length ? malos.join("<br>") : "todos válidos");
const pendientes = ps.where((p) => (p.etiquetas || []).includes("revisar")).length;
ok("Proyectos por confirmar (`revisar`)", pendientes === 0 ? true : null, pendientes ? `${pendientes} pendientes: revísalos en la revisión semanal` : "ninguno");

dv.table(["", "Comprobación", "Detalle"], filas);
```
