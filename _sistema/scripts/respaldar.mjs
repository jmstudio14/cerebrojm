#!/usr/bin/env node
// Crea una copia cifrada de tus datos personales (proyectos, notas, diario, revisiones,
// herramientas, adjuntos y configuración local). Nada de esto se sube a GitHub (ADR-0001).
//
// Uso:  node _sistema/scripts/respaldar.mjs [--vault <ruta>] [--destino <carpeta>] [--password-env VAR]
// La primera vez pregunta la carpeta de destino y la guarda en _sistema/config/respaldo.local.json.

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { crearCopia, leerCopia, nombreCopia, aplicarRetencion, obtenerPassword, RETENCION } from "./respaldo-lib.mjs";
import { escribirAtomico } from "./atomico.mjs";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const VAULT = path.resolve(arg("--vault") || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const CONFIG = path.join(VAULT, "_sistema", "config", "respaldo.local.json");

function leerConfig() {
  if (!fs.existsSync(CONFIG)) return {};
  try { return JSON.parse(fs.readFileSync(CONFIG, "utf8")); }
  catch (e) { throw new Error(`${CONFIG} no es JSON válido (${e.message}). Corrígelo o bórralo; no se ha tocado.`); }
}
function guardarConfig(c) {
  fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
  fs.writeFileSync(CONFIG, JSON.stringify(c, null, 2) + "\n", "utf8");
}

async function main() {
  const config = leerConfig();
  let destino = arg("--destino") || config.destino;
  if (!destino) {
    if (!process.stdin.isTTY) throw new Error("Falta la carpeta de destino: usa --destino <carpeta>.");
    console.log("Primera vez: ¿en qué carpeta guardo las copias? (mejor un disco externo o una carpeta sincronizada en la nube: van cifradas)");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    destino = (await rl.question("> ")).trim().replace(/^"|"$/g, "");
    rl.close();
    if (!destino) throw new Error("No se indicó carpeta.");
  }
  const relativa = path.relative(VAULT, path.resolve(destino));
  if (relativa === "" || (relativa.split(path.sep)[0] !== ".." && !path.isAbsolute(relativa))) {
    throw new Error(`La carpeta de destino no puede estar dentro del vault (Obsidian Git subiría la copia): ${destino}`);
  }
  fs.mkdirSync(destino, { recursive: true });

  const password = await obtenerPassword(args, "Contraseña de la copia (no se guarda; si la olvidas, la copia no se puede recuperar): ");
  if (!args.includes("--password-env")) {
    const repetir = await obtenerPassword(args, "Repítela: ");
    if (repetir !== password) throw new Error("Las contraseñas no coinciden.");
  }

  const ahora = new Date();
  const { buffer, total, omitidos } = crearCopia(VAULT, password, ahora);
  leerCopia(buffer, password); // verificación inmediata: la copia se puede descifrar
  const archivo = path.join(destino, nombreCopia(ahora));
  escribirAtomico(archivo, buffer);
  const borradas = aplicarRetencion(destino, RETENCION);

  guardarConfig({ ...config, destino, ultimo: ahora.toISOString() });
  console.log(`✓ Copia creada: ${archivo}`);
  console.log(`  ${total} archivos · ${(buffer.length / 1024).toFixed(1)} KB · verificada`);
  if (borradas.length) console.log(`  Retención: se borraron ${borradas.length} copias antiguas (se conservan las ${RETENCION} últimas).`);
  if (omitidos.length) {
    console.error(`⚠ Copia incompleta: ${omitidos.length} ${omitidos.length === 1 ? "entrada omitida" : "entradas omitidas"} (no están en la copia):\n` + omitidos.map((o) => "  - " + o).join("\n"));
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error("✗ " + e.message); process.exit(1); });
