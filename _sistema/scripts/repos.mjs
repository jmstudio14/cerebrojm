#!/usr/bin/env node
// Actualiza en cada proyecto con `repo` de GitHub el último push y los issues abiertos.
// Solo escribe dos líneas del frontmatter (`ultimo_push` e `issues_abiertos`); el resto
// de la nota queda byte a byte igual. Necesita la CLI `gh` con la sesión iniciada.
//
// Uso:  node _sistema/scripts/repos.mjs [--vault <ruta>]
// Salida: resumen en stdout. Si falla algún repo, la nota queda intacta, se lista la
// causa en stderr y el código de salida es 1.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const VAULT = path.resolve(arg("--vault") || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const REPO_GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

// CEREBRO_GH_FAKE solo lo usan los tests: sustituye a `gh` por un script de Node.
const FAKE = process.env.CEREBRO_GH_FAKE;
const gh = (a) => FAKE
  ? execFileSync(process.execPath, [FAKE, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  : execFileSync("gh", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const causa = (e) => String(e.stderr || e.message).trim().replace(/\s*\r?\n\s*/g, " ");

// ---------------------------------------------------------------- frontmatter
function partir(texto) {
  const m = texto.match(/^---(\r?\n)([\s\S]*?)\r?\n---/);
  return m ? { fm: m[2], ini: 3 + m[1].length, eol: m[1] } : null;
}
function leerCampo(fm, k) {
  const m = fm.match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
}
// Sustituye la línea del campo; si no existe, la inserta tras `tras` (o al final del frontmatter).
function ponerCampo(fm, eol, k, v, tras) {
  const linea = `${k}: ${v}`;
  const re = new RegExp(`^${k}:.*$`, "m");
  if (re.test(fm)) return fm.replace(re, () => linea);
  const reTras = new RegExp(`^${tras}:.*$`, "m");
  return reTras.test(fm) ? fm.replace(reTras, (l) => l + eol + linea) : fm + eol + linea;
}
function escribirSiCambia(f, contenido) {
  if (fs.readFileSync(f, "utf8") === contenido) return false;
  const tmp = f + ".tmp";
  fs.writeFileSync(tmp, contenido, "utf8");
  fs.renameSync(tmp, f); // escritura atómica
  return true;
}

// ---------------------------------------------------------------- GitHub
function consultar(owner, repo) {
  const q = `{repository(owner:"${owner}",name:"${repo}"){pushedAt issues(states:OPEN){totalCount}}}`;
  const r = JSON.parse(gh(["api", "graphql", "-f", `query=${q}`])).data?.repository;
  const fecha = r?.pushedAt && new Date(r.pushedAt); // new Date(null) sería 1970
  if (!r || isNaN(fecha) || !Number.isInteger(r.issues?.totalCount)) throw new Error("respuesta de GitHub sin pushedAt o issues");
  return { push: fecha.toISOString().slice(0, 10), issues: r.issues.totalCount };
}

try {
  gh(["auth", "status"]);
} catch (e) {
  console.error(e.code === "ENOENT"
    ? "✗ No se encuentra `gh`. Instala la CLI de GitHub: https://cli.github.com"
    : `✗ \`gh\` no tiene sesión iniciada: ejecuta \`gh auth login\`. ${causa(e)}`);
  process.exit(1);
}

const carpeta = path.join(VAULT, "01 Proyectos");
const nombres = fs.existsSync(carpeta) ? fs.readdirSync(carpeta).filter((f) => f.endsWith(".md")).sort() : [];
let consultados = 0, actualizadas = 0;
const fallos = [];

for (const f of nombres) {
  const ruta = path.join(carpeta, f);
  const texto = fs.readFileSync(ruta, "utf8");
  const p = partir(texto);
  if (!p || leerCampo(p.fm, "tipo")?.replace(/^"(.*)"$/, "$1") !== "proyecto") continue;
  const m = (leerCampo(p.fm, "repo") || "").replace(/^"(.*)"$/, "$1").trim().match(REPO_GITHUB);
  if (!m) continue;
  try {
    const { push, issues } = consultar(m[1], m[2]);
    consultados++;
    let fm = ponerCampo(p.fm, p.eol, "ultimo_push", push, "ultimo_commit");
    fm = ponerCampo(fm, p.eol, "issues_abiertos", issues, "ultimo_push");
    if (escribirSiCambia(ruta, texto.slice(0, p.ini) + fm + texto.slice(p.ini + p.fm.length))) actualizadas++;
  } catch (e) {
    fallos.push(`${f.slice(0, -3)} (${m[1]}/${m[2]}): ${causa(e)}`);
  }
}

console.log(`✓ ${consultados} repos consultados, ${actualizadas} notas actualizadas`);
if (fallos.length) {
  console.error(`✗ ${fallos.length} repo(s) sin comprobar; su nota no se ha tocado:\n` + fallos.map((x) => "  - " + x).join("\n"));
  process.exitCode = 1;
}
