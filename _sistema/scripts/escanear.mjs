#!/usr/bin/env node
// Escáner de proyectos del cerebro digital.
//
// Recorre las "carpetas madre" configuradas (cada subcarpeta = un proyecto) y crea o
// actualiza en el vault:
//   01 Proyectos/<proyecto>.md      una nota por proyecto
//   05 Herramientas/<herramienta>.md  skills, agentes y MCP que usan tus proyectos
//
// Nunca pisa lo que escribes a mano: en notas existentes solo actualiza los campos
// automáticos (repo, ultimo_commit, escaneado, uso_en, origen) y el bloque delimitado
// por <!-- escaner:inicio --> / <!-- escaner:fin -->. Estado, prioridad, progreso,
// próxima acción, valoración y el resto del texto son tuyos.
//
// Estas notas NO se suben a Git (ver .gitignore): tus datos se quedan en tu PC.
//
// Uso:  node _sistema/scripts/escanear.mjs [--vault <ruta>] [--carpetas "<ruta1>;<ruta2>"] [--hoy AAAA-MM-DD]
// Sin --carpetas usa _sistema/config/escaner.local.json (lo crea preguntando si no existe).

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------- argumentos
const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const RAIZ_SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const VAULT = path.resolve(arg("--vault") || RAIZ_SCRIPT);
const HOY = arg("--hoy") || new Date().toISOString().slice(0, 10);
const CONFIG = path.join(VAULT, "_sistema", "config", "escaner.local.json");
const DIR_PROY = path.join(VAULT, "01 Proyectos");
const DIR_HERR = path.join(VAULT, "05 Herramientas");
const BANDEJA = path.join(VAULT, "02 Notas", "Bandeja de entrada.md");
const BANDEJA_INICIAL = "---\ntipo: nota\n---\n\n# Bandeja de entrada\n\nNotas rápidas que aún no tienen sitio. Vaciar en la revisión semanal.\n";
const IGNORAR_POR_DEFECTO = ["node_modules", "$RECYCLE.BIN", "System Volume Information"];

const INICIO = "<!-- escaner:inicio -->";
const FIN = "<!-- escaner:fin -->";

// ---------------------------------------------------------------- utilidades
const leer = (f) => { try { return fs.readFileSync(f, "utf8"); } catch { return null; } };
const leerJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
const existe = (f) => fs.existsSync(f);
const esDir = (f) => { try { return fs.statSync(f).isDirectory(); } catch { return false; } };
const listar = (d) => { try { return fs.readdirSync(d); } catch { return []; } };

// Nombre válido como archivo en Windows y como enlace de Obsidian.
function nombreNota(n) {
  return n.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim();
}

function git(dir, ...a) {
  try {
    return execFileSync("git", ["-C", dir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch { return ""; }
}

// git@github.com:usuario/repo.git -> https://github.com/usuario/repo
function normalizarRemoto(url) {
  if (!url) return "";
  let u = url.trim();
  const ssh = u.match(/^git@([^:]+):(.+)$/);
  if (ssh) u = `https://${ssh[1]}/${ssh[2]}`;
  u = u.replace(/^ssh:\/\/git@/, "https://").replace(/\.git$/, "");
  u = u.replace(/^https:\/\/[^@/]+@/, "https://"); // quita credenciales incrustadas
  return /^https?:\/\//.test(u) ? u : "";
}

function fechaArchivoMasReciente(dir) {
  let max = 0;
  for (const n of listar(dir)) {
    if (n.startsWith(".") || n === "node_modules") continue;
    try { max = Math.max(max, fs.statSync(path.join(dir, n)).mtimeMs); } catch {}
  }
  return max ? new Date(max).toISOString().slice(0, 10) : "";
}

function diasDesde(fecha) {
  if (!fecha) return Infinity;
  return Math.floor((Date.parse(HOY) - Date.parse(fecha)) / 86400000);
}

// Primer párrafo con contenido real del README (sin títulos, badges ni HTML).
function descripcionReadme(dir) {
  const f = listar(dir).find((n) => /^readme(\.md|\.txt)?$/i.test(n));
  const t = f && leer(path.join(dir, f));
  if (!t) return "";
  const bloques = t.replace(/\r/g, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "").split(/\n\s*\n/);
  for (const b of bloques) {
    const limpio = b.split("\n")
      .filter((l) => !/^\s*(#|!\[|\[!\[|<|>|\||---|===|\s*[-*]\s*\[)/.test(l))
      .join(" ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (limpio.length >= 25) return limpio.length > 300 ? limpio.slice(0, 297).trimEnd() + "…" : limpio;
  }
  return "";
}

function detectarStack(dir) {
  const s = new Set();
  const pkg = leerJSON(path.join(dir, "package.json"));
  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const mapa = [["next", "Next.js"], ["react", "React"], ["vue", "Vue"], ["svelte", "Svelte"], ["@angular/core", "Angular"],
      ["vite", "Vite"], ["@tauri-apps/api", "Tauri"], ["electron", "Electron"], ["typescript", "TypeScript"],
      ["tailwindcss", "Tailwind"], ["@supabase/supabase-js", "Supabase"], ["firebase", "Firebase"], ["dexie", "Dexie"],
      ["express", "Express"], ["vitest", "Vitest"], ["@playwright/test", "Playwright"], ["jest", "Jest"]];
    for (const [d, n] of mapa) if (deps[d]) s.add(n);
    if (!s.size) s.add("Node.js");
  }
  if (existe(path.join(dir, "requirements.txt")) || existe(path.join(dir, "pyproject.toml")) ||
      listar(dir).some((n) => /\.pyw?$/.test(n))) s.add("Python");
  if (existe(path.join(dir, "Cargo.toml")) || existe(path.join(dir, "src-tauri"))) s.add("Rust");
  if (existe(path.join(dir, "go.mod"))) s.add("Go");
  if (listar(dir).some((n) => /\.(csproj|sln)$/.test(n))) s.add(".NET");
  if (!s.size && existe(path.join(dir, "index.html"))) s.add("Web estática (HTML/CSS/JS)");
  return [...s];
}

function tieneTests(dir) {
  const pkg = leerJSON(path.join(dir, "package.json"));
  if (pkg?.scripts?.test && !/no test specified/.test(pkg.scripts.test)) return true;
  return ["tests", "test", "__tests__", "e2e", "spec"].some((d) => esDir(path.join(dir, d))) ||
    listar(dir).some((n) => /^(run_tests|pytest)\b/i.test(n));
}

// Descripción de una skill desde su SKILL.md (campo description del frontmatter).
function descripcionSkill(dirSkill) {
  const t = leer(path.join(dirSkill, "SKILL.md"));
  const m = t && t.match(/^description:\s*(.+)$/m);
  if (!m) return "";
  return m[1].replace(/^["']|["']$/g, "").trim();
}

// ---------------------------------------------------------------- herramientas de un proyecto
function herramientasDe(dir) {
  const res = []; // {clave, nombre, clase, origen, instalacion, detalle}
  // Skills declaradas en skills-lock.json (con su repo de origen)
  const lock = leerJSON(path.join(dir, "skills-lock.json"));
  const deLock = {};
  if (lock) {
    const s = lock.skills ?? lock;
    const items = Array.isArray(s) ? s.map((x) => [x.name, x]) : Object.entries(s);
    for (const [nombre, meta] of items) if (nombre) deLock[nombre] = (meta && (meta.source || meta.repo || meta.url)) || "";
  }
  // Skills instaladas en carpetas
  const instaladas = {};
  for (const sd of [".claude/skills", ".agents/skills"]) {
    for (const n of listar(path.join(dir, sd))) {
      const d = path.join(dir, sd, n);
      if (esDir(d) && !instaladas[n]) instaladas[n] = descripcionSkill(d);
    }
  }
  for (const nombre of new Set([...Object.keys(deLock), ...Object.keys(instaladas)])) {
    const fuente = deLock[nombre] || "";
    const desc = instaladas[nombre] || "";
    // Agrupa por repo de origen; si no hay, por la etiqueta final "(paquete)" de la descripción.
    const paquete = fuente || (desc.match(/\(([a-z0-9][\w.-]*)\)\s*\.?["']?$/i)?.[1] ?? "");
    const clave = paquete ? `skill:${paquete.toLowerCase()}` : `skill:${nombre.toLowerCase()}`;
    const titulo = paquete ? (paquete.includes("/") ? paquete.split("/").pop() : paquete) : nombre;
    const esGitHub = /^[\w.-]+\/[\w.-]+$/.test(fuente);
    res.push({
      clave, nombre: titulo, clase: "skill",
      origen: esGitHub ? `https://github.com/${fuente}` : (/^https?:\/\//.test(fuente) ? fuente : ""),
      instalacion: esGitHub ? `npx skills add ${fuente}` : "",
      detalle: { skill: nombre, desc },
    });
  }
  // Servidores MCP (.mcp.json)
  const mcp = leerJSON(path.join(dir, ".mcp.json"));
  for (const [nombre, conf] of Object.entries(mcp?.mcpServers ?? {})) {
    const url = conf.url || "";
    const pkg = (conf.args || []).find((a) => /^@?[\w.-]+\/[\w.-]+(@[\w.^~-]+)?$|^[\w.-]+-mcp/.test(a)) || "";
    const pkgSinVersion = pkg.replace(/(.)@[^/]+$/, "$1");
    res.push({
      clave: `mcp:${nombre.toLowerCase()}`, nombre: `${nombre} (MCP)`, clase: "mcp",
      origen: url ? url : (pkgSinVersion ? `https://www.npmjs.com/package/${pkgSinVersion}` : ""),
      instalacion: url ? `Servidor HTTP: ${url}` : (conf.command ? `${conf.command} ${(conf.args || []).join(" ")}`.trim() : ""),
      detalle: {},
    });
  }
  // Agentes (.claude/agents/*.md)
  const agentes = listar(path.join(dir, ".claude", "agents")).filter((n) => n.endsWith(".md")).map((n) => n.replace(/\.md$/, ""));
  if (agentes.length) {
    res.push({ clave: `agente:${path.basename(dir).toLowerCase()}`, nombre: `Agentes de ${path.basename(dir)}`, clase: "agente",
      origen: "", instalacion: "Archivos en `.claude/agents/` del proyecto.", detalle: { agentes } });
  }
  return res;
}

// ---------------------------------------------------------------- frontmatter
function partir(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? { fm: m[1], cuerpo: texto.slice(m[0].length) } : { fm: "", cuerpo: texto };
}
function leerCampo(fm, k) {
  const m = fm.match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
}
function ponerCampo(fm, k, v) {
  const linea = `${k}: ${v}`;
  const re = new RegExp(`^${k}:.*$`, "m");
  return re.test(fm) ? fm.replace(re, () => linea) : fm + "\n" + linea;
}
const comillas = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function ponerBloque(cuerpo, bloque) {
  const nuevo = `${INICIO}\n${bloque.trim()}\n${FIN}`;
  const i = cuerpo.indexOf(INICIO), f = cuerpo.indexOf(FIN);
  if (i >= 0 && f > i) return cuerpo.slice(0, i) + nuevo + cuerpo.slice(f + FIN.length);
  // Sin marcadores (nota creada a mano): se añade al final sin tocar lo demás.
  return cuerpo.trimEnd() + "\n\n" + nuevo + "\n";
}

function escribirSiCambia(f, contenido) {
  if (leer(f) === contenido) return false;
  const tmp = f + ".tmp";
  fs.writeFileSync(tmp, contenido, "utf8");
  fs.renameSync(tmp, f); // escritura atómica
  return true;
}

// ---------------------------------------------------------------- notas de proyecto
function bloqueProyecto(p) {
  return [
    "## Datos del escáner",
    `> [!abstract] Actualizado automáticamente el ${HOY}. No edites dentro de este bloque: se sobrescribe en cada escaneo.`,
    "",
    `- **Carpeta:** \`${p.ruta}\``,
    `- **Repositorio:** ${p.repo ? `<${p.repo}>` : "sin remoto Git"}`,
    `- **Último cambio:** ${p.ultimo || "desconocido"}${p.rama ? ` · rama \`${p.rama}\`` : ""}`,
    `- **Stack:** ${p.stack.length ? p.stack.join(", ") : "sin detectar"}`,
    `- **Tiene:** ${[p.roadmap && "ROADMAP.md", p.claude && "CLAUDE.md", p.tests && "tests"].filter(Boolean).join(" · ") || "—"}`,
    `- **Herramientas:** ${p.herramientas.length ? p.herramientas.map((h) => `[[${h}]]`).join(", ") : "—"}`,
    "",
    "**Descripción (del README):**",
    p.descripcion ? `> ${p.descripcion}` : "> Sin README o sin descripción.",
  ].join("\n");
}

function notaProyectoNueva(p) {
  const dias = diasDesde(p.ultimo);
  const estado = dias < 30 ? "activo" : dias <= 120 ? "pausado" : "archivado";
  return `---
tipo: proyecto
categoria: ${p.stack.length || p.repo ? "codigo" : "personal"}
estado: ${estado}
prioridad: media
progreso: 0
inicio:
fecha_limite:
ultima_revision: ${p.ultimo || HOY}
proxima_accion: ""
repo: ${comillas(p.repo)}
ruta_local: ${comillas(p.ruta)}
ultimo_commit: ${p.ultimo}
escaneado: ${HOY}
etiquetas: [revisar]
---

# ${p.nombre}

> [!warning] Creado por el escáner
> \`estado\` se deduce de la fecha del último cambio (menos de 30 días: activo; de 30 a 120: pausado; más de 120: archivado). \`prioridad\` y \`progreso\` son valores por defecto. Revísalos, escribe una \`proxima_accion\` real y quita la etiqueta \`revisar\`.

## Objetivo
¿Qué significa "terminado"?

## Próximas tareas
- [ ] Confirmar estado, prioridad y progreso, y definir una próxima acción real

## Bloqueos / riesgos
-

## Registro
- ${HOY}: nota creada por el escáner.

${INICIO}
${bloqueProyecto(p)}
${FIN}
`;
}

function actualizarProyecto(f, p) {
  const { fm, cuerpo } = partir(leer(f));
  let nfm = fm;
  nfm = ponerCampo(nfm, "repo", comillas(p.repo || leerCampo(fm, "repo")?.replace(/^"|"$/g, "") || ""));
  nfm = ponerCampo(nfm, "ruta_local", comillas(p.ruta));
  nfm = ponerCampo(nfm, "ultimo_commit", p.ultimo);
  nfm = ponerCampo(nfm, "escaneado", HOY);
  return `---\n${nfm}\n---\n${ponerBloque(cuerpo, bloqueProyecto(p))}`;
}

// ---------------------------------------------------------------- notas de herramienta
function bloqueHerramienta(h) {
  const l = ["## Datos del escáner", `> [!abstract] Actualizado automáticamente el ${HOY}.`, ""];
  l.push(`- **Origen:** ${h.origen ? `<${h.origen}>` : "por confirmar"}`);
  l.push(`- **Instalación:** ${h.instalacion ? `\`${h.instalacion}\`` : "por confirmar"}`);
  l.push(`- **Se usa en:** ${[...h.proyectos].sort().map((x) => `[[${x}]]`).join(", ")}`);
  if (h.skills.size) {
    l.push("", "**Skills incluidas:**");
    for (const [n, d] of [...h.skills].sort()) l.push(`- \`${n}\`${d ? `: ${d.length > 160 ? d.slice(0, 157) + "…" : d}` : ""}`);
  }
  if (h.agentes.length) l.push("", "**Agentes:**", ...h.agentes.sort().map((a) => `- \`${a}\``));
  return l.join("\n");
}

function notaHerramientaNueva(h) {
  return `---
tipo: herramienta
clase: ${h.clase}
origen: ${comillas(h.origen)}
uso_en: [${[...h.proyectos].sort().map((x) => comillas(`[[${x}]]`)).join(", ")}]
uso:
valoracion:
ultima_revision: ${HOY}
escaneado: ${HOY}
etiquetas: [revisar]
---

# ${h.nombre}

> [!info] Ficha creada por el escáner
> El escáner sabe **dónde aparece**, no cuánto la usas. Rellena \`uso\` (frecuente · ocasional · probando · descartada) y \`valoracion\` (1-5), escribe qué es en tus palabras y quita \`revisar\`.

## Qué es
Por confirmar.

## Notas
-

${INICIO}
${bloqueHerramienta(h)}
${FIN}
`;
}

function actualizarHerramienta(f, h) {
  const { fm, cuerpo } = partir(leer(f));
  let nfm = ponerCampo(fm, "uso_en", `[${[...h.proyectos].sort().map((x) => comillas(`[[${x}]]`)).join(", ")}]`);
  if (h.origen && !(leerCampo(fm, "origen") || "").replace(/"/g, "")) nfm = ponerCampo(nfm, "origen", comillas(h.origen));
  nfm = ponerCampo(nfm, "escaneado", HOY);
  return `---\n${nfm}\n---\n${ponerBloque(cuerpo, bloqueHerramienta(h))}`;
}

// ---------------------------------------------------------------- configuración
async function obtenerConfig() {
  const desdeArgs = arg("--carpetas");
  if (desdeArgs) return { carpetas: desdeArgs.split(";").map((s) => s.trim()).filter(Boolean), ignorar: [] };
  const c = leerJSON(CONFIG);
  if (c?.carpetas?.length) return { ignorar: [], ...c };
  if (!process.stdin.isTTY) {
    console.error(`No hay configuración. Crea ${CONFIG} o usa --carpetas "C:\\ruta1;D:\\ruta2".`);
    process.exit(2);
  }
  console.log("Primera vez: ¿qué carpetas contienen tus proyectos? Cada subcarpeta será un proyecto.");
  console.log('Escribe una o varias rutas separadas por ";"  (ejemplo: C:\\Programacion;D:\\Creativo)');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const r = await rl.question("> ");
  rl.close();
  const carpetas = r.split(";").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
  if (!carpetas.length) { console.error("Ninguna carpeta indicada."); process.exit(2); }
  const nueva = { carpetas, ignorar: [] };
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  fs.writeFileSync(CONFIG, JSON.stringify(nueva, null, 2) + "\n", "utf8");
  console.log(`Guardado en ${path.relative(VAULT, CONFIG)} (solo en tu PC, no se sube a Git).\n`);
  return nueva;
}

// ---------------------------------------------------------------- principal
async function main() {
  const { carpetas, ignorar = [] } = await obtenerConfig();
  const ignorados = new Set([...IGNORAR_POR_DEFECTO, ...ignorar].map((s) => s.toLowerCase()));
  fs.mkdirSync(DIR_PROY, { recursive: true });
  fs.mkdirSync(DIR_HERR, { recursive: true });
  // La bandeja es personal y no está en Git (ADR-0001): en un clon nuevo hay que crearla.
  if (!existe(BANDEJA)) { fs.mkdirSync(path.dirname(BANDEJA), { recursive: true }); fs.writeFileSync(BANDEJA, BANDEJA_INICIAL, "utf8"); }
  const vaultReal = fs.realpathSync(VAULT);

  const proyectos = [];
  for (const madre of carpetas) {
    if (!esDir(madre)) { console.warn(`⚠ No existe o no es una carpeta: ${madre}`); continue; }
    for (const n of listar(madre).sort()) {
      const dir = path.join(madre, n);
      if (n.startsWith(".") || !esDir(dir) || ignorados.has(n.toLowerCase())) continue;
      if (fs.realpathSync(dir) === vaultReal) continue; // no escanear el propio vault
      const ultimo = git(dir, "log", "-1", "--format=%cs") || fechaArchivoMasReciente(dir);
      // Mismo nombre en dos carpetas madre: se distingue con el nombre de la madre.
      let nombre = nombreNota(n);
      if (proyectos.some((q) => q.nombre === nombre)) nombre = nombreNota(`${n} (${path.basename(path.resolve(madre))})`);
      proyectos.push({
        nombre, ruta: path.resolve(dir),
        repo: normalizarRemoto(git(dir, "remote", "get-url", "origin")),
        rama: git(dir, "rev-parse", "--abbrev-ref", "HEAD"),
        ultimo, descripcion: descripcionReadme(dir), stack: detectarStack(dir),
        roadmap: existe(path.join(dir, "ROADMAP.md")), claude: existe(path.join(dir, "CLAUDE.md")) || existe(path.join(dir, ".claude", "CLAUDE.md")),
        tests: tieneTests(dir), herrRaw: herramientasDe(dir), herramientas: [],
      });
    }
  }

  // Unir herramientas de todos los proyectos
  const herr = new Map();
  for (const p of proyectos) {
    for (const h of p.herrRaw) {
      if (!herr.has(h.clave)) herr.set(h.clave, { ...h, nombre: nombreNota(h.nombre), proyectos: new Set(), skills: new Map(), agentes: [] });
      const t = herr.get(h.clave);
      t.proyectos.add(p.nombre);
      if (!t.origen && h.origen) { t.origen = h.origen; t.instalacion = h.instalacion; }
      if (h.detalle.skill) t.skills.set(h.detalle.skill, t.skills.get(h.detalle.skill) || h.detalle.desc);
      if (h.detalle.agentes) t.agentes = h.detalle.agentes;
    }
  }
  // Nombres de las fichas de herramienta que usa cada proyecto
  for (const p of proyectos) p.herramientas = [...new Set(p.herrRaw.map((h) => herr.get(h.clave).nombre))].sort();

  const cont = { pc: 0, pa: 0, hc: 0, ha: 0 };
  for (const p of proyectos) {
    const f = path.join(DIR_PROY, `${p.nombre}.md`);
    if (existe(f)) { if (escribirSiCambia(f, actualizarProyecto(f, p))) cont.pa++; }
    else { escribirSiCambia(f, notaProyectoNueva(p)); cont.pc++; }
  }
  for (const h of herr.values()) {
    const f = path.join(DIR_HERR, `${h.nombre}.md`);
    if (existe(f)) { if (escribirSiCambia(f, actualizarHerramienta(f, h))) cont.ha++; }
    else { escribirSiCambia(f, notaHerramientaNueva(h)); cont.hc++; }
  }

  // Notas que ya no corresponden a ninguna carpeta: se avisan, nunca se borran.
  const vistos = new Set(proyectos.map((p) => p.nombre));
  const huerfanos = listar(DIR_PROY).filter((n) => n.endsWith(".md") && !n.startsWith("_"))
    .map((n) => n.replace(/\.md$/, ""))
    .filter((n) => !vistos.has(n) && /^ruta_local:/m.test(leer(path.join(DIR_PROY, `${n}.md`)) || ""));

  console.log(`✓ ${proyectos.length} proyectos escaneados: ${cont.pc} nuevos, ${cont.pa} actualizados.`);
  console.log(`✓ ${herr.size} herramientas: ${cont.hc} nuevas, ${cont.ha} actualizadas.`);
  if (huerfanos.length) console.log(`ℹ Notas sin carpeta en este escaneo (no se tocan): ${huerfanos.join(", ")}`);
  if (cont.pc) console.log("→ Abre el Panel en Obsidian: los proyectos nuevos tienen la etiqueta `revisar`.");
}

main().catch((e) => { console.error("✗ Error en el escáner:", e.message); process.exit(1); });
