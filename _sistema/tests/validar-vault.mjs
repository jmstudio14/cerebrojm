// Valida el frontmatter de las notas de proyecto contra los valores que espera el Panel.
// Uso: node _sistema/tests/validar-vault.mjs [carpeta]   (sale con código 1 si hay errores)
import fs from "node:fs";
import path from "node:path";

const carpeta = process.argv[2] || "01 Proyectos";
const PERMITIDOS = {
  categoria: ["codigo", "personal", "creativo"],
  estado: ["idea", "activo", "pausado", "bloqueado", "completado", "archivado"],
  prioridad: ["alta", "media", "baja"],
};
const OBLIGATORIOS = ["tipo", "categoria", "estado", "prioridad", "progreso", "ultima_revision", "proxima_accion"];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function frontmatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const datos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = linea.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) datos[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").trim();
  }
  return datos;
}

const errores = [];
let proyectos = 0;
for (const nombre of fs.readdirSync(carpeta).filter((f) => f.endsWith(".md")).sort()) {
  const fm = frontmatter(fs.readFileSync(path.join(carpeta, nombre), "utf8"));
  const err = (msg) => errores.push(`${nombre}: ${msg}`);
  if (!fm) { err("sin frontmatter"); continue; }
  if (fm.tipo !== "proyecto") continue; // índices y otras notas
  proyectos++;
  for (const k of OBLIGATORIOS) if (!(k in fm)) err(`falta el campo \`${k}\``);
  for (const [k, vals] of Object.entries(PERMITIDOS)) {
    if (k in fm && !vals.includes(fm[k])) err(`\`${k}: ${fm[k]}\` no es válido (${vals.join(", ")})`);
  }
  if ("progreso" in fm) {
    const n = Number(fm.progreso);
    if (!Number.isInteger(n) || n < 0 || n > 100) err(`\`progreso: ${fm.progreso}\` debe ser un entero 0-100`);
  }
  for (const k of ["inicio", "fecha_limite", "ultima_revision", "ultimo_push"]) {
    if (fm[k] && !FECHA.test(fm[k])) err(`\`${k}: ${fm[k]}\` debe tener formato AAAA-MM-DD`);
  }
}

if (errores.length) {
  console.error(`✗ ${errores.length} error(es) en ${proyectos} proyecto(s):\n` + errores.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${proyectos} proyectos válidos`);
