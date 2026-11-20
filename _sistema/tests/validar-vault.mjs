// Valida el frontmatter de las notas de proyecto contra los valores que espera el Panel.
// También valida las fichas de 05 Herramientas.
// Uso: node _sistema/tests/validar-vault.mjs [ruta-del-vault]   (sale con código 1 si hay errores)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VAULT = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const carpeta = path.join(VAULT, "01 Proyectos");
const PERMITIDOS = {
  categoria: ["codigo", "personal", "creativo"],
  estado: ["idea", "activo", "pausado", "bloqueado", "completado", "archivado"],
  prioridad: ["alta", "media", "baja"],
};
const OBLIGATORIOS = ["tipo", "categoria", "estado", "prioridad", "progreso", "ultima_revision", "proxima_accion"];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const REPO_GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/; // igual que en repos.mjs
// `proxima_accion` vacío es válido: es la alerta «sin próxima acción» del Panel.
const PUEDEN_ESTAR_VACIOS = ["proxima_accion"];
// Formato AAAA-MM-DD y que el día exista (2026-13-45 y 2026-02-30 no).
const fechaReal = (s) => FECHA.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

function frontmatter(texto) {
  const m = (texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const datos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = linea.match(/^([A-Za-z_]+):\s*(.*)$/);
    // null y ~ son YAML vacío (Dataview los trata como sin valor); se aceptan comillas simples y dobles.
    if (kv) datos[kv[1]] = /^(null|~)$/i.test(kv[2].trim()) ? "" : kv[2].replace(/^(["'])(.*)\1$/, "$2").trim();
  }
  return datos;
}

const errores = [];
let proyectos = 0;
for (const nombre of (fs.existsSync(carpeta) ? fs.readdirSync(carpeta) : []).filter((f) => f.endsWith(".md")).sort()) {
  const fm = frontmatter(fs.readFileSync(path.join(carpeta, nombre), "utf8"));
  const err = (msg) => errores.push(`${nombre}: ${msg}`);
  if (!fm) { err("sin frontmatter"); continue; }
  if (fm.tipo !== "proyecto") continue; // índices y otras notas
  proyectos++;
  for (const k of OBLIGATORIOS) {
    if (!(k in fm)) err(`falta el campo \`${k}\``);
    else if (fm[k] === "" && !PUEDEN_ESTAR_VACIOS.includes(k)) err(`el campo \`${k}\` está vacío`);
  }
  for (const [k, vals] of Object.entries(PERMITIDOS)) {
    if (fm[k] && !vals.includes(fm[k])) err(`\`${k}: ${fm[k]}\` no es válido (${vals.join(", ")})`);
  }
  if (fm.progreso) {
    const n = Number(fm.progreso);
    if (!Number.isInteger(n) || n < 0 || n > 100) err(`\`progreso: ${fm.progreso}\` debe ser un entero 0-100`);
  }
  if ("issues_abiertos" in fm) {
    const n = Number(fm.issues_abiertos);
    if (fm.issues_abiertos === "" || !Number.isInteger(n) || n < 0) err(`\`issues_abiertos: ${fm.issues_abiertos}\` debe ser un entero 0 o mayor`);
  }
  // Misma forma que acepta repos.mjs; un `repo` de GitHub mal escrito se saltaría en silencio.
  if (fm.repo && !(/^https?:\/\/\S+$/.test(fm.repo) && (!/^https?:\/\/(www\.)?github\.com(\/|$)/i.test(fm.repo) || REPO_GITHUB.test(fm.repo)))) {
    err(`\`repo: ${fm.repo}\` debe ser una URL https (en GitHub: https://github.com/usuario/repo)`);
  }
  for (const k of ["inicio", "fecha_limite", "ultima_revision", "ultimo_push", "ultimo_commit", "escaneado"]) {
    if (fm[k] && !fechaReal(fm[k])) err(`\`${k}: ${fm[k]}\` debe ser una fecha real con formato AAAA-MM-DD`);
  }
}

// ---------- Herramientas ----------
const HERR = path.join(VAULT, "05 Herramientas");
const PERM_H = { clase: ["skill", "agente", "plugin", "mcp"], uso: ["", "frecuente", "ocasional", "probando", "descartada"] };
let herramientas = 0;
if (fs.existsSync(HERR)) {
  for (const nombre of fs.readdirSync(HERR).filter((f) => f.endsWith(".md")).sort()) {
    const fm = frontmatter(fs.readFileSync(path.join(HERR, nombre), "utf8"));
    const err = (msg) => errores.push(`05 Herramientas/${nombre}: ${msg}`);
    if (!fm) { err("sin frontmatter"); continue; }
    if (fm.tipo !== "herramienta") continue;
    herramientas++;
    for (const [k, vals] of Object.entries(PERM_H)) {
      if (!(k in fm)) err(`falta el campo \`${k}\``);
      else if (!vals.includes(fm[k])) err(`\`${k}: ${fm[k]}\` no es válido (${vals.filter(Boolean).join(", ")})`);
    }
    if (fm.valoracion && !/^[1-5]$/.test(fm.valoracion)) err(`\`valoracion: ${fm.valoracion}\` debe ser 1-5 o vacío`);
    if (fm.origen && !/^https?:\/\//.test(fm.origen)) err(`\`origen\` debe ser una URL http(s)`);
  }
}

if (errores.length) {
  console.error(`✗ ${errores.length} error(es) en ${proyectos} proyecto(s):\n` + errores.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${proyectos} proyectos y ${herramientas} herramientas válidos`);
