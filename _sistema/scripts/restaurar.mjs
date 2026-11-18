#!/usr/bin/env node
// Restaura una copia cifrada creada con respaldar.mjs.
// Por defecto NO sobrescribe archivos locales más recientes que los de la copia.
//
// Uso:  node _sistema/scripts/restaurar.mjs [--vault <ruta>] [--archivo <copia.cjmbak>] [--forzar] [--password-env VAR]
// Sin --archivo, usa la copia más reciente de la carpeta guardada en respaldo.local.json.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leerCopia, restaurar, listarCopias, obtenerPassword } from "./respaldo-lib.mjs";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const VAULT = path.resolve(arg("--vault") || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const CONFIG = path.join(VAULT, "_sistema", "config", "respaldo.local.json");

async function main() {
  let archivo = arg("--archivo");
  if (!archivo) {
    let destino;
    try { destino = JSON.parse(fs.readFileSync(CONFIG, "utf8")).destino; } catch {}
    if (!destino) throw new Error("No sé dónde están las copias: usa --archivo <ruta de la copia>.");
    const copias = listarCopias(destino);
    if (!copias.length) throw new Error(`No hay copias en ${destino}.`);
    console.log(`Copias en ${destino}:`);
    for (const c of copias.slice(-5)) console.log(`  ${c}`);
    archivo = path.join(destino, copias.at(-1));
    console.log(`Se restaurará la más reciente: ${copias.at(-1)}`);
  }
  const password = await obtenerPassword(args, "Contraseña de la copia: ");
  const manifiesto = leerCopia(fs.readFileSync(archivo), password); // si falla, no se ha escrito nada
  const r = restaurar(VAULT, manifiesto, { forzar: args.includes("--forzar") });
  console.log(`✓ Copia del ${manifiesto.creado}: ${r.restaurados.length} restaurados, ${r.sinCambios.length} sin cambios, ${r.omitidos.length} omitidos.`);
  if (r.omitidos.length) {
    console.log("  Omitidos porque tu versión local es más reciente (usa --forzar para sobrescribirlos):");
    for (const o of r.omitidos) console.log(`   - ${o}`);
  }
}

main().catch((e) => { console.error("✗ " + e.message); process.exit(1); });
