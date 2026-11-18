#!/usr/bin/env node
// Resumen del estado de los proyectos del vault, con las mismas reglas que el Panel
// (00 Panel.md, sección «Necesitan atención»). Solo lee: no modifica ninguna nota.
//
// Uso:  node _sistema/scripts/estado.mjs [--vault <ruta>] [--hoy AAAA-MM-DD]
// Salida: JSON con el recuento por estado y las listas de proyectos activos o bloqueados
// que están vencidos, bloqueados, sin próxima acción, estancados (más de 14 días sin
// revisión) o con el límite cerca (menos de 14 días).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const VAULT = path.resolve(arg("--vault") || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const HOY = arg("--hoy") || new Date().toISOString().slice(0, 10);
const DIAS = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);

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

const carpeta = path.join(VAULT, "01 Proyectos");
const nombres = fs.existsSync(carpeta) ? fs.readdirSync(carpeta).filter((f) => f.endsWith(".md")).sort() : [];
const porEstado = {};
const listas = { vencidos: [], bloqueados: [], sin_proxima_accion: [], estancados: [], limite_cercano: [] };
const atencion = new Set();

for (const f of nombres) {
  const fm = frontmatter(fs.readFileSync(path.join(carpeta, f), "utf8"));
  if (!fm || fm.tipo !== "proyecto") continue;
  const nombre = f.slice(0, -3);
  porEstado[fm.estado] = (porEstado[fm.estado] || 0) + 1;
  if (fm.estado !== "activo" && fm.estado !== "bloqueado") continue;
  const vencido = fm.fecha_limite && DIAS(fm.fecha_limite, HOY) < 0;
  const motivos = [];
  if (vencido) motivos.push("vencidos");
  if (fm.estado === "bloqueado") motivos.push("bloqueados");
  if (!fm.proxima_accion) motivos.push("sin_proxima_accion");
  if (!fm.ultima_revision || DIAS(HOY, fm.ultima_revision) > 14) motivos.push("estancados");
  if (fm.fecha_limite && !vencido && DIAS(fm.fecha_limite, HOY) < 14) motivos.push("limite_cercano");
  for (const m of motivos) listas[m].push(nombre);
  if (motivos.length) atencion.add(nombre);
}

console.log(JSON.stringify({ hoy: HOY, por_estado: porEstado, necesitan_atencion: atencion.size, ...listas }, null, 2));
