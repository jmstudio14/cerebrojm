// La vista de Bases usa los mismos estados y campos que el validador y la plantilla de proyecto.
// Ejecutar desde la raíz del repo: node --test _sistema/tests/vistas.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const leer = (ruta) => fs.readFileSync(new URL("../../" + ruta, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("la vista de proyectos cubre todos los estados y solo usa campos de la plantilla", () => {
  const base = leer("_sistema/vistas/Proyectos.base");
  assert.match(base, /file\.inFolder\("01 Proyectos"\)/);
  assert.match(base, /tipo == "proyecto"/);

  const estados = JSON.parse(leer("_sistema/tests/validar-vault.mjs").match(/estado: (\[[^\]]*\])/)[1]);
  const formula = base.match(/^ {2}grupo: (.*)$/m)[1];
  assert.deepEqual(estados.filter((e) => !formula.includes(`· ${e}"`)), [], "estados sin grupo");

  const campos = new Set([...leer("_sistema/plantillas/Proyecto.md").split("\n---")[0].matchAll(/^([a-z_]+):/gm)].map((m) => m[1]));
  const columnas = [...base.split("\n    order:\n")[1].split("\n    sort:")[0].matchAll(/- (\S+)/g)].map((m) => m[1]);
  assert.ok(columnas.length > 1);
  assert.deepEqual(columnas.filter((c) => c !== "file.name" && !campos.has(c)), [], "columnas que no existen en la plantilla");
});
