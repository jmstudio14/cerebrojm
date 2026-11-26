// Ejecuta la plantilla de Templater con respuestas simuladas y pasa la nota por el validador real.
// Ejecutar desde la raíz del repo: node --test _sistema/tests/plantilla-preguntas.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => fs.readFileSync(path.join(RAIZ, ruta), "utf8");

async function aplicar(respuestas, { titulo = "Sin título", existentes = [], avisos = [] } = {}) {
  const codigo = leer("_sistema/plantillas/Proyecto con preguntas.md").match(/^<%\*([\s\S]*?)-%>\s*$/)[1];
  const cola = [...respuestas];
  const movidos = [];
  const responder = async () => {
    const r = cola.shift();
    if (r === null) throw new Error("cancelado"); // throw_on_cancel de Templater
    return r;
  };
  const tp = {
    system: { prompt: responder, suggester: responder },
    date: { now: () => "2026-11-26" },
    obsidian: { Notice: class { constructor(texto) { avisos.push(texto); } } },
    file: { title: titulo, path: () => `02 Notas/${titulo}.md`, move: async (destino) => movidos.push(destino) },
    app: {
      vault: {
        getAbstractFileByPath: (ruta) => (ruta === "_sistema/plantillas/Proyecto.md" || existentes.includes(ruta) ? { path: ruta } : null),
        cachedRead: async (archivo) => leer(archivo.path),
      },
    },
  };
  const AsyncFunction = (async () => {}).constructor;
  const nota = await new AsyncFunction("tp", `let tR = "";\n${codigo}\nreturn tR;`)(tp);
  return { nota, movidos, sinUsar: cola.length };
}

// Templater solo enseña «Template parsing error»: el motivo tiene que salir en un aviso propio.
async function fallaAvisando(patron, respuestas, opciones) {
  const avisos = [];
  await assert.rejects(aplicar(respuestas, { ...opciones, avisos }), patron);
  assert.match(avisos.join(" "), patron);
}

test("la nota generada lleva las respuestas, se mueve a 01 Proyectos y pasa el validador", async () => {
  const { nota, movidos, sinUsar } = await aplicar(["Huerto: urbano $&", "personal", "activo", "alta", 'Comprar "tierra" $1']);
  assert.equal(sinUsar, 0);
  assert.deepEqual(movidos, ["01 Proyectos/Huerto urbano $&"]);
  assert.match(nota, /^categoria: personal$/m);
  assert.match(nota, /^estado: activo$/m);
  assert.match(nota, /^prioridad: alta$/m);
  assert.ok(nota.includes('\nproxima_accion: "Comprar \\"tierra\\" $1"'), "próxima acción entrecomillada");
  assert.ok(nota.includes("# Huerto: urbano $&"), "título");
  assert.doesNotMatch(nota, /\{\{|<%/);

  const vault = fs.mkdtempSync(path.join(os.tmpdir(), "plantilla-"));
  try {
    fs.mkdirSync(path.join(vault, "01 Proyectos"));
    fs.writeFileSync(path.join(vault, "01 Proyectos", "Huerto.md"), nota);
    const salida = execFileSync(process.execPath, [path.join(RAIZ, "_sistema/tests/validar-vault.mjs"), vault], { encoding: "utf8" });
    assert.match(salida, /1 proyectos/);
  } finally {
    fs.rmSync(vault, { recursive: true, force: true });
  }
});

test("si ya existe un proyecto con ese nombre, falla sin mover ni escribir", async () => {
  await fallaAvisando(/Ya existe/, ["Huerto", "personal", "idea", "media", ""], { existentes: ["01 Proyectos/Huerto.md"] });
});

test("cancelar una pregunta no deja nada a medias", async () => {
  await assert.rejects(aplicar(["Huerto", null]), /cancelado/);
});

test("sin nombre válido no crea nada", async () => {
  await fallaAvisando(/nombre/, [" /: ", "personal", "idea", "media", ""]);
});
