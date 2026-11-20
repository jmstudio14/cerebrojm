// Tests de estado.mjs con un vault temporal: las alertas deben seguir las reglas del Panel.
// Ejecutar: node --test _sistema/tests/estado.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ESTADO = path.join(RAIZ, "_sistema", "scripts", "estado.mjs");

const vault = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-estado-"));
fs.mkdirSync(path.join(vault, "01 Proyectos"));
const proyecto = (nombre, campos) => {
  const base = { tipo: "proyecto", estado: "activo", ultima_revision: "2026-11-17", proxima_accion: "Hacer algo", fecha_limite: "" };
  const fm = Object.entries({ ...base, ...campos }).map(([k, v]) => `${k}: "${v}"`);
  fs.writeFileSync(path.join(vault, "01 Proyectos", `${nombre}.md`), `---\n${fm.join("\n")}\n---\n\n# ${nombre}\n`);
};

proyecto("al-dia", {});
proyecto("sin-accion", { proxima_accion: "" });
proyecto("estancado", { ultima_revision: "2026-11-03" });
proyecto("limite-de-catorce-dias", { ultima_revision: "2026-11-04" });
proyecto("bloqueado", { estado: "bloqueado" });
proyecto("vencido", { fecha_limite: "2026-11-10" });
proyecto("limite-cercano", { fecha_limite: "2026-12-01" });
proyecto("limite-lejano", { fecha_limite: "2026-12-02" });
proyecto("sin-push", { ultimo_push: "2026-10-18" });
proyecto("push-de-treinta-dias", { ultimo_push: "2026-10-19" });
proyecto("bloqueado-sin-push", { estado: "bloqueado", ultimo_push: "2026-09-01" });
proyecto("archivado", { estado: "archivado", proxima_accion: "" });
fs.writeFileSync(path.join(vault, "01 Proyectos", "_Índice.md"), "---\ntipo: indice\n---\n");

const salida = JSON.parse(execFileSync(process.execPath, [ESTADO, "--vault", vault, "--hoy", "2026-11-18"], { encoding: "utf8" }));

test("recuento por estado, sin contar índices", () => {
  assert.deepEqual(salida.por_estado, { activo: 9, bloqueado: 2, archivado: 1 });
});

test("cada alerta sigue las reglas del Panel", () => {
  assert.deepEqual(salida.sin_proxima_accion, ["sin-accion"]);
  assert.deepEqual(salida.estancados, ["estancado"]);
  assert.deepEqual(salida.bloqueados, ["bloqueado-sin-push", "bloqueado"]);
  assert.deepEqual(salida.vencidos, ["vencido"]);
  assert.deepEqual(salida.limite_cercano, ["limite-cercano"]);
  assert.deepEqual(salida.sin_push, ["sin-push"]);
});

test("14 días exactos sin revisar no es estancado; 13 y 14 días al límite se distinguen", () => {
  assert.ok(!salida.estancados.includes("limite-de-catorce-dias"));
  assert.ok(!salida.limite_cercano.includes("limite-lejano"));
});

test("sin push: más de 30 días (31 sí, 30 exactos no) y solo en proyectos activos", () => {
  assert.ok(salida.sin_push.includes("sin-push"));
  assert.ok(!salida.sin_push.includes("push-de-treinta-dias"));
  assert.ok(!salida.sin_push.includes("bloqueado-sin-push"));
  assert.ok(!salida.sin_push.includes("al-dia")); // sin ultimo_push no hay alerta
});

test("los archivados no generan alertas y cada proyecto cuenta una vez", () => {
  assert.ok(!Object.values(salida).flat().includes("archivado"));
  assert.equal(salida.necesitan_atencion, 7);
});

test("no modifica ninguna nota", () => {
  const antes = fs.readFileSync(path.join(vault, "01 Proyectos", "al-dia.md"), "utf8");
  execFileSync(process.execPath, [ESTADO, "--vault", vault, "--hoy", "2026-11-18"]);
  assert.equal(fs.readFileSync(path.join(vault, "01 Proyectos", "al-dia.md"), "utf8"), antes);
});

// --- Robustez (auditoría 2026-11-20) ---
const vault2 = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-estado2-"));
fs.mkdirSync(path.join(vault2, "01 Proyectos"));
const nota2 = (nombre, texto) => fs.writeFileSync(path.join(vault2, "01 Proyectos", `${nombre}.md`), texto);
const ejecutar = (v, extra = [], env = {}) =>
  JSON.parse(execFileSync(process.execPath, [ESTADO, "--vault", v, "--hoy", "2026-11-18", ...extra], { encoding: "utf8", env: { ...process.env, ...env } }));

test("«hoy» por defecto es la fecha local del equipo, no la de UTC", () => {
  for (const zona of ["Pacific/Kiritimati", "Pacific/Pago_Pago"]) { // UTC+14 y UTC-11: una de las dos cae siempre en otro día que UTC
    const r = JSON.parse(execFileSync(process.execPath, [ESTADO, "--vault", vault], { encoding: "utf8", env: { ...process.env, TZ: zona } }));
    assert.equal(r.hoy, new Intl.DateTimeFormat("sv-SE", { timeZone: zona }).format(new Date()), zona);
  }
});

test("una nota con BOM UTF-8 se cuenta como cualquier otra", () => {
  nota2("con-bom", String.fromCharCode(0xfeff) + "---\ntipo: proyecto\nestado: activo\nultima_revision: 2026-11-17\nproxima_accion: Algo\n---\n");
  assert.deepEqual(ejecutar(vault2).por_estado, { activo: 1 });
});

test("null, ~ y '' valen como vacío, igual que en Dataview", () => {
  for (const [i, valor] of ["null", "~", "''", '""', ""].entries()) {
    nota2(`vacia-${i}`, `---\ntipo: proyecto\nestado: activo\nultima_revision: 2026-11-17\nproxima_accion: ${valor}\n---\n`);
  }
  const r = ejecutar(vault2);
  assert.deepEqual(r.sin_proxima_accion.sort(), ["vacia-0", "vacia-1", "vacia-2", "vacia-3", "vacia-4"]);
});

test("comillas simples: 'activo' es activo", () => {
  const v = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-estado3-"));
  fs.mkdirSync(path.join(v, "01 Proyectos"));
  fs.writeFileSync(path.join(v, "01 Proyectos", "p.md"), "---\ntipo: proyecto\nestado: 'activo'\nultima_revision: 2026-11-17\nproxima_accion: 'Algo'\n---\n");
  const r = ejecutar(v);
  assert.deepEqual(r.por_estado, { activo: 1 });
  assert.deepEqual(r.sin_proxima_accion, []);
  fs.rmSync(v, { recursive: true, force: true });
});

test.after(() => { for (const d of [vault, vault2]) fs.rmSync(d, { recursive: true, force: true }); });
