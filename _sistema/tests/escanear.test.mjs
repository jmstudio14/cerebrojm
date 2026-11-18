// Tests del escáner con proyectos ficticios creados en una carpeta temporal.
// Ejecutar: node --test _sistema/tests/escanear.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ESCANER = path.join(RAIZ, "_sistema", "scripts", "escanear.mjs");
const VALIDADOR = path.join(RAIZ, "_sistema", "tests", "validar-vault.mjs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-"));
const madre = path.join(tmp, "proyectos");
const vault = path.join(tmp, "vault");
const escribir = (rel, txt) => {
  const f = path.join(madre, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, txt);
};
const gitEn = (dir, ...a) => execFileSync("git", ["-C", dir, "-c", "user.name=Test", "-c", "user.email=t@example.com", ...a], { stdio: "ignore" });
const escanear = (...extra) =>
  execFileSync("node", [ESCANER, "--vault", vault, "--carpetas", madre, "--hoy", "2026-11-18", ...extra], { encoding: "utf8" });
const nota = (rel) => fs.readFileSync(path.join(vault, rel), "utf8");

// --- Proyectos ficticios ---
// app-web: Git con remoto SSH, Next.js, skills con lock, MCP, agentes, tests
escribir("app-web/README.md", "# App Web\n\n![badge](https://x/y.svg)\n\nGestor de tareas de prueba para comprobar el escáner del cerebro digital.\n");
escribir("app-web/package.json", JSON.stringify({ scripts: { test: "vitest run" }, dependencies: { next: "15", react: "19" }, devDependencies: { typescript: "5" } }));
escribir("app-web/ROADMAP.md", "# Roadmap\n");
escribir("app-web/CLAUDE.md", "# Reglas\n");
escribir("app-web/skills-lock.json", JSON.stringify({ skills: { "writing-plans": { source: "autor/pack-skills" }, "tdd": { source: "autor/pack-skills" } } }));
escribir("app-web/.claude/skills/writing-plans/SKILL.md", "---\nname: writing-plans\ndescription: Escribe planes antes de tocar código\n---\n");
escribir("app-web/.claude/skills/revisar/SKILL.md", "---\nname: revisar\ndescription: Revisión previa al merge. (kitpro)\n---\n");
escribir("app-web/.mcp.json", JSON.stringify({ mcpServers: { docs: { type: "http", url: "https://docs.example.com/mcp" }, navegador: { command: "npx", args: ["@acme/browser-mcp@latest", "--headless"] } } }));
escribir("app-web/.claude/agents/auditor.md", "# auditor\n");
fs.mkdirSync(path.join(madre, "app-web", "tests"), { recursive: true });
gitEn(path.join(madre, "app-web"), "init", "-q");
gitEn(path.join(madre, "app-web"), "remote", "add", "origin", "git@github.com:usuario/app-web.git");
gitEn(path.join(madre, "app-web"), "add", ".");
gitEn(path.join(madre, "app-web"), "commit", "-q", "-m", "inicio", "--date", "2026-11-10T10:00:00");
execFileSync("git", ["-C", path.join(madre, "app-web"), "-c", "user.name=T", "-c", "user.email=t@e.com", "commit", "--amend", "-q", "--no-edit"],
  { env: { ...process.env, GIT_COMMITTER_DATE: "2026-11-10T10:00:00" }, stdio: "ignore" });

// script-py: sin Git, Python, comparte la skill del mismo pack
escribir("script-py/main.py", "print('hola')\n");
escribir("script-py/skills-lock.json", JSON.stringify({ skills: { "tdd": { source: "autor/pack-skills" } } }));
// carpetas que deben ignorarse
escribir(".oculta/x.txt", "x");
escribir("node_modules/x/index.js", "");

test("primer escaneo crea notas de proyecto y herramientas", () => {
  const out = escanear();
  assert.match(out, /2 proyectos escaneados: 2 nuevos/);
  const p = nota("01 Proyectos/app-web.md");
  assert.match(p, /^tipo: proyecto$/m);
  assert.match(p, /^estado: activo$/m, "último commit hace 8 días → activo");
  assert.match(p, /^repo: "https:\/\/github.com\/usuario\/app-web"$/m, "remoto SSH normalizado");
  assert.match(p, /^ultimo_commit: 2026-11-10$/m);
  assert.match(p, /Gestor de tareas de prueba/);
  assert.match(p, /Stack:\*\* Next\.js, React, TypeScript\n/);
  assert.match(p, /ROADMAP\.md · CLAUDE\.md · tests/);
  assert.ok(!fs.existsSync(path.join(vault, "01 Proyectos", ".oculta.md")));
  assert.ok(!fs.existsSync(path.join(vault, "01 Proyectos", "node_modules.md")));
  assert.match(nota("01 Proyectos/script-py.md"), /Python/);
});

test("las herramientas se agrupan por paquete y enlazan a los proyectos", () => {
  const pack = nota("05 Herramientas/pack-skills.md");
  assert.match(pack, /^clase: skill$/m);
  assert.match(pack, /^origen: "https:\/\/github.com\/autor\/pack-skills"$/m);
  assert.match(pack, /npx skills add autor\/pack-skills/);
  assert.match(pack, /\[\[app-web\]\], \[\[script-py\]\]/);
  assert.match(pack, /`writing-plans`: Escribe planes/);
  assert.match(nota("05 Herramientas/kitpro.md"), /`revisar`/, "agrupada por la etiqueta (kitpro) de su descripción");
  assert.match(nota("05 Herramientas/docs (MCP).md"), /^origen: "https:\/\/docs.example.com\/mcp"$/m);
  assert.match(nota("05 Herramientas/navegador (MCP).md"), /npmjs.com\/package\/@acme\/browser-mcp"/);
  assert.match(nota("05 Herramientas/Agentes de app-web.md"), /`auditor`/);
});

test("lo generado pasa el validador del vault", () => {
  const out = execFileSync("node", [VALIDADOR, vault], { encoding: "utf8" });
  assert.match(out, /2 proyectos y 5 herramientas válidos/);
});

test("reescanear no pisa lo escrito a mano y es idempotente", () => {
  const f = path.join(vault, "01 Proyectos", "app-web.md");
  let t = fs.readFileSync(f, "utf8")
    .replace(/^estado: .*$/m, "estado: pausado")
    .replace(/^proxima_accion: .*$/m, 'proxima_accion: "Publicar la beta"')
    .replace("## Objetivo\n", "## Objetivo\nMi texto personal.\n");
  fs.writeFileSync(f, t);
  const h = path.join(vault, "05 Herramientas", "pack-skills.md");
  fs.writeFileSync(h, fs.readFileSync(h, "utf8").replace(/^uso:$/m, "uso: frecuente").replace(/^valoracion:$/m, "valoracion: 5"));

  escribir("app-web/README.md", "# App Web\n\nDescripción nueva tras cambiar el README del proyecto de prueba.\n");
  escanear();
  t = fs.readFileSync(f, "utf8");
  assert.match(t, /^estado: pausado$/m);
  assert.match(t, /^proxima_accion: "Publicar la beta"$/m);
  assert.match(t, /Mi texto personal\./);
  assert.match(t, /Descripción nueva tras cambiar el README/, "el bloque automático sí se actualiza");
  assert.equal(t.split("<!-- escaner:inicio -->").length, 2, "un solo bloque automático");
  const ht = fs.readFileSync(h, "utf8");
  assert.match(ht, /^uso: frecuente$/m);
  assert.match(ht, /^valoracion: 5$/m);

  const out = escanear();
  assert.match(out, /0 nuevos, 0 actualizados/, "un segundo escaneo sin cambios no modifica nada");
});

test("una carpeta que desaparece se avisa pero su nota no se borra", () => {
  fs.rmSync(path.join(madre, "script-py"), { recursive: true });
  const out = escanear();
  assert.match(out, /Notas sin carpeta en este escaneo \(no se tocan\): script-py/);
  assert.ok(fs.existsSync(path.join(vault, "01 Proyectos", "script-py.md")));
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
