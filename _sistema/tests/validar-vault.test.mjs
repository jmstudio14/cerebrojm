// Casos negativos del validador de frontmatter, con notas ficticias en una carpeta temporal.
// Ejecutar: node --test _sistema/tests/validar-vault.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VALIDADOR = path.join(path.dirname(fileURLToPath(import.meta.url)), "validar-vault.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-validar-"));

const BASE = {
  tipo: "proyecto", categoria: "codigo", estado: "activo", prioridad: "media",
  progreso: "40", ultima_revision: "2026-11-18", proxima_accion: "Escribir tests",
};

// Crea un vault con una sola nota de proyecto, con los campos de BASE modificados por `cambios`.
function validar(cambios) {
  const vault = fs.mkdtempSync(path.join(tmp, "v-"));
  fs.mkdirSync(path.join(vault, "01 Proyectos"));
  const campos = { ...BASE, ...cambios };
  const fm = Object.entries(campos).map(([k, v]) => `${k}: ${v}`).join("\n");
  fs.writeFileSync(path.join(vault, "01 Proyectos", "P.md"), `---\n${fm}\n---\n# P\n`);
  const r = spawnSync(process.execPath, [VALIDADOR, vault], { encoding: "utf8" });
  return { ok: r.status === 0, salida: r.stdout + r.stderr };
}

test("una nota correcta pasa", () => assert.ok(validar({}).ok));

test("proxima_accion vacío es válido (es la alerta «sin próxima acción»)", () => assert.ok(validar({ proxima_accion: '""' }).ok));

test("obligatorios vacíos fallan", () => {
  for (const k of ["categoria", "estado", "prioridad", "progreso", "ultima_revision"]) {
    const r = validar({ [k]: "" });
    assert.ok(!r.ok, k);
    assert.match(r.salida, new RegExp(`\`${k}\``), k);
  }
});

test("progreso vacío ya no cuenta como 0", () => assert.match(validar({ progreso: "" }).salida, /progreso. está vacío/));

test("fechas imposibles fallan y las reales pasan", () => {
  for (const f of ["2026-13-45", "2026-02-30", "2026-00-10"]) assert.ok(!validar({ ultima_revision: f }).ok, f);
  assert.ok(validar({ ultima_revision: "2028-02-29" }).ok, "29 de febrero de un año bisiesto");
});

test("valores fuera de lista y progreso fuera de rango fallan", () => {
  assert.ok(!validar({ estado: "haciendo" }).ok);
  assert.ok(!validar({ progreso: "101" }).ok);
});

test("repo: vacío, GitHub bien formado u otro host pasan; GitHub mal escrito falla", () => {
  for (const ok of ['""', '"https://github.com/usuario/repo"', "https://github.com/usuario/repo.git", '"https://gitlab.com/usuario/repo"']) assert.ok(validar({ repo: ok }).ok, ok);
  for (const mal of ['"http://github.com/usuario/repo"', '"www.github.com/usuario/repo"', '"github.com/usuario/repo"', '"https://github.com/usuario/repo/tree/main"', '"usuario/repo"']) {
    const r = validar({ repo: mal });
    assert.ok(!r.ok, mal);
    assert.match(r.salida, /repo/, mal);
  }
});

test("null y ~ valen como vacío; comillas simples y BOM no engañan", () => {
  assert.ok(!validar({ estado: "null" }).ok);
  assert.ok(!validar({ progreso: "~" }).ok);
  assert.ok(validar({ proxima_accion: "null" }).ok, "proxima_accion vacío sigue siendo válido");
  assert.ok(validar({ estado: "'activo'", proxima_accion: "'Algo'" }).ok);
  const v = fs.mkdtempSync(path.join(tmp, "v-"));
  fs.mkdirSync(path.join(v, "01 Proyectos"));
  const fm = Object.entries(BASE).map(([k, x]) => k + ": " + x).join("\n");
  fs.writeFileSync(path.join(v, "01 Proyectos", "P.md"), String.fromCharCode(0xfeff) + "---\n" + fm + "\n---\n");
  assert.ok(spawnSync(process.execPath, [VALIDADOR, v], { encoding: "utf8" }).status === 0, "nota con BOM");
});

test("sin ruta usa la raíz del propio repo, no la carpeta actual", () => {
  const r = spawnSync(process.execPath, [VALIDADOR], { cwd: tmp, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /válidos/);
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
