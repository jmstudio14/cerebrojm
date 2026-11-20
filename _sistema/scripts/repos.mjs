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
import { escribirAtomico } from "./atomico.mjs";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const VAULT = path.resolve(arg("--vault") || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const REPO_GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

// CEREBRO_GH_FAKE y CEREBRO_GH_TIMEOUT_MS solo los usan los tests: sustituyen a `gh` por un
// script de Node y acortan el límite de espera.
const FAKE = process.env.CEREBRO_GH_FAKE;
const TIMEOUT_MS = Number(process.env.CEREBRO_GH_TIMEOUT_MS) || 30000;
const gh = (a) => FAKE
  ? execFileSync(process.execPath, [FAKE, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS })
  : execFileSync("gh", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS });
const causa = (e) => e.code === "ETIMEDOUT"
  ? `gh no respondió en ${TIMEOUT_MS / 1000} s`
  : String(e.stderr || e.message).trim().replace(/\s*\r?\n\s*/g, " ");

// ---------------------------------------------------------------- frontmatter
function partir(texto) {
  const bom = texto.charCodeAt(0) === 0xfeff ? 1 : 0; // BOM UTF-8
  const m = texto.slice(bom).match(/^(---(\r?\n))([\s\S]*?)\r?\n---/);
  return m ? { fm: m[3], ini: bom + m[1].length, eol: m[2] } : null;
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
  escribirAtomico(f, contenido);
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
    : e.code === "ETIMEDOUT"
      ? `✗ ${causa(e)} al comprobar la sesión.`
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
  const repo = (leerCampo(p.fm, "repo") || "").replace(/^(["'])(.*)\1$/, "$2").trim();
  const m = repo.match(REPO_GITHUB);
  if (!m) {
    // Un repo de otro host es legítimo; uno de GitHub que no cuadra (http://, www., sin esquema, /tree/main) es un error de la nota.
    if (/github\.com/i.test(repo)) fallos.push(`${f.slice(0, -3)}: URL de GitHub no reconocida (${repo}); usa https://github.com/usuario/repo`);
    continue;
  }
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
