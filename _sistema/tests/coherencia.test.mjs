// Coherencia de la configuración del repo con la política de datos (ADR-0001).
// Ejecutar desde la raíz del repo: node --test _sistema/tests/coherencia.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ignorado = (ruta) => {
  try { execFileSync("git", ["-C", RAIZ, "check-ignore", "-q", "--no-index", ruta]); return true; }
  catch { return false; }
};

const PERSONALES = [
  "01 Proyectos/Un proyecto.md",
  "02 Notas/Una idea.md",
  "02 Notas/Bandeja de entrada.md",
  "03 Diario/2026-11-18.md",
  "04 Revisiones/2026-11-18.md",
  "05 Herramientas/Una herramienta.md",
  "_sistema/adjuntos/captura.png",
  "_sistema/config/escaner.local.json",
  "_sistema/config/respaldo.local.json",
  ".obsidian/plugins/obsidian-full-calendar/data.json",
  "cerebrojm-2026-11-20_120000.cjmbak", // copia cifrada guardada por error en el vault
  "00 Panel.md.tmp", // restos de una escritura atómica interrumpida
];
const SISTEMA = [
  "00 Panel.md",
  "01 Proyectos/_Índice de proyectos.md",
  "02 Notas/_Índice de notas.md",
  "03 Diario/_Índice del diario.md",
  "03 Diario/.gitkeep",
  "04 Revisiones/_Índice de revisiones.md",
  "04 Revisiones/.gitkeep",
  "05 Herramientas/_Índice de herramientas.md",
  "_sistema/plantillas/Proyecto.md",
  "_sistema/scripts/escanear.mjs",
  "_sistema/config/escaner.ejemplo.json",
];

test("la zona personal está excluida de Git", () => {
  const fallan = PERSONALES.filter((r) => !ignorado(r));
  assert.deepEqual(fallan, [], `Deberían estar en .gitignore: ${fallan.join(", ")}`);
});

test("los archivos del sistema siguen versionándose", () => {
  const fallan = SISTEMA.filter((r) => ignorado(r));
  assert.deepEqual(fallan, [], `No deberían estar ignorados: ${fallan.join(", ")}`);
});

test("ningún archivo personal está versionado en el repo", () => {
  const versionados = execFileSync("git", ["-C", RAIZ, "ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);
  const indebidos = versionados.filter((f) => ignorado(f));
  assert.deepEqual(indebidos, [], `Versionados pero deberían ser personales: ${indebidos.join(", ")}`);
});

test("los mensajes de commit automáticos no incluyen el nombre del equipo", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, ".obsidian/plugins/obsidian-git/data.json"), "utf8"));
  for (const k of ["commitMessage", "autoCommitMessage"]) assert.ok(!/\{\{hostname\}\}/.test(cfg[k] ?? ""), k);
});
