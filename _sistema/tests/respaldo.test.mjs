// Tests de la copia de seguridad cifrada (FEAT-002 / ADR-0001).
// Ejecutar: node --test _sistema/tests/respaldo.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { recogerArchivos, crearCopia, leerCopia, restaurar, aplicarRetencion, listarCopias } from "../scripts/respaldo-lib.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const RESPALDAR = path.join(RAIZ, "_sistema", "scripts", "respaldar.mjs");
const RESTAURAR = path.join(RAIZ, "_sistema", "scripts", "restaurar.mjs");
const PWD = "contraseña de prueba";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-respaldo-"));
const vault = path.join(tmp, "vault");
const destino = path.join(tmp, "copias");
const escribir = (rel, txt) => { const f = path.join(vault, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(vault, rel))).digest("hex");

// Zona personal
escribir("01 Proyectos/Proyecto A.md", "---\ntipo: proyecto\nestado: activo\n---\n# A\n");
escribir("02 Notas/Bandeja de entrada.md", "- idea\n");
escribir("03 Diario/2026-11-18.md", "# Hoy\n");
escribir("04 Revisiones/2026-11-18.md", "# Revisión\n");
escribir("05 Herramientas/Skill X.md", "# X\n");
escribir("_sistema/adjuntos/captura.png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]));
escribir("_sistema/config/escaner.local.json", '{"carpetas":["C:\\\\x"]}');
// Sistema (no debe entrar en la copia)
escribir("01 Proyectos/_Índice de proyectos.md", "# Índice\n");
escribir("03 Diario/.gitkeep", "");
escribir("00 Panel.md", "# Panel\n");
escribir("_sistema/scripts/agenda.js", "// código\n");
escribir("_sistema/config/escaner.ejemplo.json", "{}");

const PERSONALES = [
  "01 Proyectos/Proyecto A.md", "02 Notas/Bandeja de entrada.md", "03 Diario/2026-11-18.md",
  "04 Revisiones/2026-11-18.md", "05 Herramientas/Skill X.md", "_sistema/adjuntos/captura.png",
  "_sistema/config/escaner.local.json",
];

test("recoge exactamente la zona personal (sin índices, .gitkeep ni archivos del sistema)", () => {
  assert.deepEqual(recogerArchivos(vault), [...PERSONALES].sort());
});

test("ida y vuelta: respaldar, borrar y restaurar reproduce los archivos byte a byte", () => {
  const antes = Object.fromEntries(PERSONALES.map((r) => [r, hash(r)]));
  const { buffer, total } = crearCopia(vault, PWD);
  assert.equal(total, PERSONALES.length);
  for (const r of PERSONALES) fs.rmSync(path.join(vault, r));
  const res = restaurar(vault, leerCopia(buffer, PWD));
  assert.equal(res.restaurados.length, PERSONALES.length);
  for (const r of PERSONALES) assert.equal(hash(r), antes[r], r);
});

test("la copia está cifrada: no contiene texto legible de las notas", () => {
  const { buffer } = crearCopia(vault, PWD);
  assert.ok(!buffer.includes(Buffer.from("tipo: proyecto")));
  assert.ok(!buffer.includes(Buffer.from("Proyecto A")));
});

test("contraseña incorrecta: error claro y no se escribe nada", () => {
  const { buffer } = crearCopia(vault, PWD);
  assert.throws(() => leerCopia(buffer, "otra"), /Contraseña incorrecta/);
  const dañada = Buffer.from(buffer); dañada[dañada.length - 1] ^= 0xff;
  assert.throws(() => leerCopia(dañada, PWD), /Contraseña incorrecta o copia dañada/);
  assert.throws(() => leerCopia(Buffer.from("no es una copia"), PWD), /No es una copia/);
});

test("restaurar no pisa un archivo local más reciente; con forzar, sí", () => {
  const { buffer } = crearCopia(vault, PWD);
  const ruta = "01 Proyectos/Proyecto A.md";
  const abs = path.join(vault, ruta);
  fs.writeFileSync(abs, "versión local más nueva\n");
  const futuro = new Date(Date.now() + 60_000); fs.utimesSync(abs, futuro, futuro);
  const m = leerCopia(buffer, PWD);
  const r1 = restaurar(vault, m);
  assert.ok(r1.omitidos.includes(ruta));
  assert.equal(fs.readFileSync(abs, "utf8"), "versión local más nueva\n");
  const r2 = restaurar(vault, m, { forzar: true });
  assert.ok(r2.restaurados.includes(ruta));
  assert.match(fs.readFileSync(abs, "utf8"), /tipo: proyecto/);
  const r3 = restaurar(vault, m);
  assert.equal(r3.restaurados.length, 0, "una segunda restauración no cambia nada");
});

test("retención: conserva las 10 últimas copias y no toca otros archivos", () => {
  const dir = path.join(tmp, "retencion");
  fs.mkdirSync(dir);
  for (let i = 1; i <= 12; i++) fs.writeFileSync(path.join(dir, `cerebrojm-2026-01-${String(i).padStart(2, "0")}_120000.cjmbak`), "x");
  fs.writeFileSync(path.join(dir, "otro-archivo.zip"), "y");
  const borradas = aplicarRetencion(dir, 10);
  assert.deepEqual(borradas, ["cerebrojm-2026-01-01_120000.cjmbak", "cerebrojm-2026-01-02_120000.cjmbak"]);
  assert.equal(listarCopias(dir).length, 10);
  assert.ok(fs.existsSync(path.join(dir, "otro-archivo.zip")));
});

test("CLI: respaldar y restaurar de punta a punta, y registro de la fecha de la última copia", () => {
  const env = { ...process.env, CJM_PWD: PWD };
  const out = execFileSync("node", [RESPALDAR, "--vault", vault, "--destino", destino, "--password-env", "CJM_PWD"], { env, encoding: "utf8" });
  assert.match(out, /Copia creada/);
  assert.match(out, /7 archivos/);
  const cfg = JSON.parse(fs.readFileSync(path.join(vault, "_sistema/config/respaldo.local.json"), "utf8"));
  assert.equal(path.resolve(cfg.destino), path.resolve(destino));
  assert.ok(!Number.isNaN(Date.parse(cfg.ultimo)));
  fs.rmSync(path.join(vault, "03 Diario/2026-11-18.md"));
  const out2 = execFileSync("node", [RESTAURAR, "--vault", vault, "--password-env", "CJM_PWD"], { env, encoding: "utf8" });
  assert.match(out2, /1 restaurados/);
  assert.ok(fs.existsSync(path.join(vault, "03 Diario/2026-11-18.md")));
  assert.throws(() => execFileSync("node", [RESTAURAR, "--vault", vault, "--password-env", "MAL"], { env: { ...env, MAL: "x" }, stdio: "pipe" }));
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
