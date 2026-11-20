// Tests de la escritura atómica con reintento (Windows puede bloquear un archivo unos instantes).
// Ejecutar: node --test _sistema/tests/atomico.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { escribirAtomico } from "../scripts/atomico.mjs";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-atomico-"));
const error = (code) => Object.assign(new Error(code), { code });

test("reintenta ante EPERM y acaba escribiendo sin dejar .tmp", () => {
  const f = path.join(tmp, "a.md");
  let llamadas = 0;
  escribirAtomico(f, "hola", { renombrar: (a, b) => { if (++llamadas < 3) throw error("EPERM"); fs.renameSync(a, b); } });
  assert.equal(llamadas, 3);
  assert.equal(fs.readFileSync(f, "utf8"), "hola");
  assert.ok(!fs.existsSync(f + ".tmp"));
});

test("si no se desbloquea, lanza el error y borra el .tmp", () => {
  const f = path.join(tmp, "b.md");
  fs.writeFileSync(f, "original");
  assert.throws(() => escribirAtomico(f, "nuevo", { renombrar: () => { throw error("EBUSY"); }, intentos: 3 }), { code: "EBUSY" });
  assert.equal(fs.readFileSync(f, "utf8"), "original");
  assert.ok(!fs.existsSync(f + ".tmp"));
});

test("un error que no es de bloqueo no se reintenta", () => {
  const f = path.join(tmp, "c.md");
  let llamadas = 0;
  assert.throws(() => escribirAtomico(f, "x", { renombrar: () => { llamadas++; throw error("ENOENT"); } }), { code: "ENOENT" });
  assert.equal(llamadas, 1);
  assert.ok(!fs.existsSync(f + ".tmp"));
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
