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
proyecto("archivado", { estado: "archivado", proxima_accion: "" });
fs.writeFileSync(path.join(vault, "01 Proyectos", "_Índice.md"), "---\ntipo: indice\n---\n");

const salida = JSON.parse(execFileSync("node", [ESTADO, "--vault", vault, "--hoy", "2026-11-18"], { encoding: "utf8" }));

test("recuento por estado, sin contar índices", () => {
  assert.deepEqual(salida.por_estado, { activo: 7, bloqueado: 1, archivado: 1 });
});

test("cada alerta sigue las reglas del Panel", () => {
  assert.deepEqual(salida.sin_proxima_accion, ["sin-accion"]);
  assert.deepEqual(salida.estancados, ["estancado"]);
  assert.deepEqual(salida.bloqueados, ["bloqueado"]);
  assert.deepEqual(salida.vencidos, ["vencido"]);
  assert.deepEqual(salida.limite_cercano, ["limite-cercano"]);
});

test("14 días exactos sin revisar no es estancado; 13 y 14 días al límite se distinguen", () => {
  assert.ok(!salida.estancados.includes("limite-de-catorce-dias"));
  assert.ok(!salida.limite_cercano.includes("limite-lejano"));
});

test("los archivados no generan alertas y cada proyecto cuenta una vez", () => {
  assert.ok(!Object.values(salida).flat().includes("archivado"));
  assert.equal(salida.necesitan_atencion, 5);
});

test("no modifica ninguna nota", () => {
  const antes = fs.readFileSync(path.join(vault, "01 Proyectos", "al-dia.md"), "utf8");
  execFileSync("node", [ESTADO, "--vault", vault, "--hoy", "2026-11-18"]);
  assert.equal(fs.readFileSync(path.join(vault, "01 Proyectos", "al-dia.md"), "utf8"), antes);
});
