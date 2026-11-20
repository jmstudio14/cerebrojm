// Tests de repos.mjs con un vault temporal y un `gh` falso (CEREBRO_GH_FAKE).
// Ejecutar: node --test _sistema/tests/repos.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOS = path.join(RAIZ, "_sistema", "scripts", "repos.mjs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-repos-"));
const FAKE = path.join(tmp, "gh-falso.mjs");
// Responde según el repo de la consulta; `roto` falla como lo haría gh con un 404.
fs.writeFileSync(FAKE, `
const a = process.argv.slice(2);
if (a[0] === "auth") process.exit(process.env.FAKE_SIN_SESION ? 1 : 0);
const nombre = /name:"([^"]+)"/.exec(a.join(" "))[1];
if (nombre === "roto") { console.error("GraphQL: Could not resolve to a Repository with the name 'roto'."); process.exit(1); }
if (nombre === "cuelga") { setInterval(() => {}, 1000); } else {
  const datos = { uno: ["2026-11-10T23:30:00Z", 3], dos: ["2026-10-01T00:00:00Z", 0] }[nombre];
  console.log(JSON.stringify({ data: { repository: { pushedAt: datos[0], issues: { totalCount: datos[1] } } } }));
}
`);

function vaultCon(notas) {
  const vault = fs.mkdtempSync(path.join(tmp, "vault-"));
  fs.mkdirSync(path.join(vault, "01 Proyectos"));
  for (const [nombre, texto] of Object.entries(notas)) fs.writeFileSync(path.join(vault, "01 Proyectos", nombre + ".md"), texto);
  return vault;
}
const leer = (vault, nombre) => fs.readFileSync(path.join(vault, "01 Proyectos", nombre + ".md"), "utf8");
const ejecutar = (vault, env = {}) =>
  spawnSync(process.execPath, [REPOS, "--vault", vault], { encoding: "utf8", env: { ...process.env, CEREBRO_GH_FAKE: FAKE, ...env } });
const nota = (repo, extra = "", eol = "\n") =>
  ["---", "tipo: proyecto", `repo: ${repo}`, "ultimo_commit: 2026-11-01", ...(extra ? extra.split("\n") : []),
    "etiquetas: []", "---", "", "# Nota", "texto con ñ y acentos"].join(eol) + eol;

test("escribe los dos campos tras ultimo_commit y deja el resto igual (LF y CRLF)", () => {
  for (const eol of ["\n", "\r\n"]) {
    const original = nota('"https://github.com/usuario/uno.git"', "", eol);
    const vault = vaultCon({ uno: original });
    const r = ejecutar(vault);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /1 repos consultados, 1 notas actualizadas/);
    const esperado = original.replace("ultimo_commit: 2026-11-01", `ultimo_commit: 2026-11-01${eol}ultimo_push: 2026-11-10${eol}issues_abiertos: 3`);
    assert.equal(leer(vault, "uno"), esperado);
  }
});

test("sustituye los campos si ya existían, sin duplicarlos", () => {
  const vault = vaultCon({ uno: nota("https://github.com/usuario/uno", "ultimo_push: 2025-01-01\nissues_abiertos: 9") });
  assert.equal(ejecutar(vault).status, 0);
  const texto = leer(vault, "uno");
  assert.equal(texto.match(/^ultimo_push:/gm).length, 1);
  assert.equal(texto.match(/^issues_abiertos:/gm).length, 1);
  assert.match(texto, /^ultimo_push: 2026-11-10$/m);
  assert.match(texto, /^issues_abiertos: 3$/m);
});

test("sin ultimo_commit, añade los campos al final del frontmatter", () => {
  const original = "---\ntipo: proyecto\nrepo: https://github.com/usuario/dos\n---\n\n# Nota\n";
  const vault = vaultCon({ dos: original });
  assert.equal(ejecutar(vault).status, 0);
  assert.equal(leer(vault, "dos"), original.replace("\n---\n\n#", "\nultimo_push: 2026-10-01\nissues_abiertos: 0\n---\n\n#"));
});

test("repo vacío, no GitHub u otro tipo de nota: nota intacta", () => {
  const notas = {
    vacio: nota('""'),
    otro: nota("https://gitlab.com/usuario/uno"),
    indice: "---\ntipo: indice\nrepo: https://github.com/usuario/uno\n---\n",
  };
  const vault = vaultCon(notas);
  const r = ejecutar(vault);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /0 repos consultados, 0 notas actualizadas/);
  for (const [nombre, texto] of Object.entries(notas)) assert.equal(leer(vault, nombre), texto);
});

test("un repo que falla deja su nota intacta, se avisa con la causa, sigue con el resto y sale con 1", () => {
  const roto = nota("https://github.com/usuario/roto");
  const vault = vaultCon({ roto, uno: nota("https://github.com/usuario/uno") });
  const r = ejecutar(vault);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /roto \(usuario\/roto\).*Could not resolve to a Repository/);
  assert.equal(leer(vault, "roto"), roto);
  assert.match(leer(vault, "uno"), /^ultimo_push: 2026-11-10$/m);
});

test("una segunda ejecución sin cambios no reescribe la nota ni deja temporales", () => {
  const vault = vaultCon({ uno: nota("https://github.com/usuario/uno") });
  assert.equal(ejecutar(vault).status, 0);
  const f = path.join(vault, "01 Proyectos", "uno.md");
  const antiguo = new Date("2020-01-01T00:00:00Z");
  fs.utimesSync(f, antiguo, antiguo);
  const r = ejecutar(vault);
  assert.match(r.stdout, /1 repos consultados, 0 notas actualizadas/);
  assert.equal(fs.statSync(f).mtimeMs, antiguo.getTime());
  assert.deepEqual(fs.readdirSync(path.join(vault, "01 Proyectos")), ["uno.md"]);
});

test("sin sesión de gh o sin gh instalado: mensaje claro y salida 1, sin tocar notas", () => {
  const original = nota("https://github.com/usuario/uno");
  const vault = vaultCon({ uno: original });
  const sinSesion = ejecutar(vault, { FAKE_SIN_SESION: "1" });
  assert.equal(sinSesion.status, 1);
  assert.match(sinSesion.stderr, /gh auth login/);
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^path$/i.test(k)));
  const sinGh = spawnSync(process.execPath, [REPOS, "--vault", vault], { encoding: "utf8", env: { ...env, PATH: "" } });
  assert.equal(sinGh.status, 1);
  assert.match(sinGh.stderr, /No se encuentra `gh`/);
  assert.equal(leer(vault, "uno"), original);
});

// --- Robustez (auditoría 2026-11-20) ---
test("si gh se cuelga, se corta con un aviso claro, la nota queda intacta y se sigue con el resto", () => {
  const cuelga = nota("https://github.com/usuario/cuelga");
  const vault = vaultCon({ cuelga, uno: nota("https://github.com/usuario/uno") });
  const r = ejecutar(vault, { CEREBRO_GH_TIMEOUT_MS: "400" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /cuelga \(usuario\/cuelga\): gh no respondió/);
  assert.equal(leer(vault, "cuelga"), cuelga);
  assert.match(leer(vault, "uno"), /^ultimo_push: 2026-11-10$/m);
});

test("una nota con BOM UTF-8 y un repo con comillas simples también se actualizan", () => {
  const bom = String.fromCharCode(0xfeff);
  const original = bom + nota("'https://github.com/usuario/uno'");
  const vault = vaultCon({ uno: original });
  const r = ejecutar(vault);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(leer(vault, "uno"), original.replace("ultimo_commit: 2026-11-01", "ultimo_commit: 2026-11-01\nultimo_push: 2026-11-10\nissues_abiertos: 3"));
});

test("una URL de GitHub mal escrita se avisa en vez de saltarse en silencio", () => {
  for (const url of ["http://github.com/usuario/uno", "www.github.com/usuario/uno", "github.com/usuario/uno", "https://github.com/usuario/uno/tree/main"]) {
    const original = nota(url);
    const vault = vaultCon({ uno: original });
    const r = ejecutar(vault);
    assert.equal(r.status, 1, url);
    assert.match(r.stderr, /uno: URL de GitHub no reconocida/, url);
    assert.equal(leer(vault, "uno"), original, url);
  }
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
