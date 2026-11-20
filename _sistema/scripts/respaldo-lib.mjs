// Copia de seguridad cifrada de la "zona personal" del vault (ADR-0001).
// Sin dependencias: node:crypto (scrypt + AES-256-GCM) y node:zlib (gzip).
//
// Formato .cjmbak:
//   "CJMBAK1\n" (8 bytes) | sal (16) | iv (12) | etiqueta GCM (16) | datos cifrados
// Los datos descifrados son un JSON comprimido con gzip:
//   { version: 1, creado: ISO, archivos: [{ ruta, mtime, sha256, datos (base64) }] }

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { escribirAtomico } from "./atomico.mjs";

export const MAGIA = Buffer.from("CJMBAK1\n");
export const PATRON_COPIA = /^cerebrojm-\d{4}-\d{2}-\d{2}_\d{6}\.cjmbak$/;
export const RETENCION = 10;

// Carpetas y archivos que son del usuario y no van a Git (ver .gitignore y ADR-0001).
export const ZONA_PERSONAL = ["01 Proyectos", "02 Notas", "03 Diario", "04 Revisiones", "05 Herramientas", "_sistema/adjuntos"];
const CONFIG_LOCAL = "_sistema/config";
// Archivos del sistema que viven dentro de la zona personal y SÍ están en Git.
const esDelSistema = (nombre) => nombre.startsWith("_Índice") || nombre === ".gitkeep";

const PARAMS_SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function derivarClave(password, sal) {
  if (!password) throw new Error("La contraseña no puede estar vacía.");
  return crypto.scryptSync(password, sal, 32, PARAMS_SCRYPT);
}

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const aPosix = (p) => p.split(path.sep).join("/");

/** Ruta de una copia sin salir del vault: relativa y sin segmentos `..` (nombres como "a...b.md" son válidos). */
export const rutaSegura = (ruta) => !path.isAbsolute(ruta) && !ruta.split(/[\\/]/).includes("..");

// Una carpeta que no existe no es un fallo; cualquier otro error de lectura o un enlace simbólico
// (no se siguen) se anota en `omitidos` para que la copia incompleta no pase por buena.
function recorrer(dir, base, salida, omitidos) {
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) {
    if (e.code !== "ENOENT") omitidos.push(`${aPosix(path.relative(base, dir))} (no se pudo leer: ${e.code})`);
    return;
  }
  for (const e of entradas) {
    const abs = path.join(dir, e.name);
    if (e.isSymbolicLink()) omitidos.push(`${aPosix(path.relative(base, abs))} (enlace simbólico)`);
    else if (e.isDirectory()) recorrer(abs, base, salida, omitidos);
    else if (e.isFile() && !esDelSistema(e.name) && !e.name.endsWith(".tmp")) salida.push(aPosix(path.relative(base, abs)));
  }
}

/** Rutas relativas (con "/") de todos los archivos personales del vault. Lo que no se puede leer se añade a `omitidos`. */
export function recogerArchivos(vault, omitidos = []) {
  const lista = [];
  for (const carpeta of ZONA_PERSONAL) recorrer(path.join(vault, carpeta), vault, lista, omitidos);
  const cfg = path.join(vault, CONFIG_LOCAL);
  try {
    for (const n of fs.readdirSync(cfg)) if (n.endsWith(".local.json")) lista.push(`${CONFIG_LOCAL}/${n}`);
  } catch (e) {
    if (e.code !== "ENOENT") omitidos.push(`${CONFIG_LOCAL} (no se pudo leer: ${e.code})`);
  }
  return lista.sort();
}

/** Crea el contenido cifrado de una copia. Devuelve { buffer, total, omitidos }. */
export function crearCopia(vault, password, ahora = new Date()) {
  const omitidos = [];
  const archivos = recogerArchivos(vault, omitidos).map((ruta) => {
    const abs = path.join(vault, ruta);
    const datos = fs.readFileSync(abs);
    return { ruta, mtime: fs.statSync(abs).mtimeMs, sha256: sha256(datos), datos: datos.toString("base64") };
  });
  const plano = zlib.gzipSync(Buffer.from(JSON.stringify({ version: 1, creado: ahora.toISOString(), archivos })));
  const sal = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const cifrador = crypto.createCipheriv("aes-256-gcm", derivarClave(password, sal), iv);
  const cifrado = Buffer.concat([cifrador.update(plano), cifrador.final()]);
  return { buffer: Buffer.concat([MAGIA, sal, iv, cifrador.getAuthTag(), cifrado]), total: archivos.length, omitidos };
}

/** Descifra y valida una copia. Lanza un error claro si la contraseña es incorrecta o el archivo está dañado. */
export function leerCopia(buffer, password) {
  if (buffer.length < MAGIA.length + 44 || !buffer.subarray(0, MAGIA.length).equals(MAGIA)) {
    throw new Error("No es una copia de CerebroJM o está dañada.");
  }
  let o = MAGIA.length;
  const sal = buffer.subarray(o, (o += 16));
  const iv = buffer.subarray(o, (o += 12));
  const etiqueta = buffer.subarray(o, (o += 16));
  const descifrador = crypto.createDecipheriv("aes-256-gcm", derivarClave(password, sal), iv);
  descifrador.setAuthTag(etiqueta);
  let plano;
  try {
    plano = Buffer.concat([descifrador.update(buffer.subarray(o)), descifrador.final()]);
  } catch {
    throw new Error("Contraseña incorrecta o copia dañada.");
  }
  const manifiesto = JSON.parse(zlib.gunzipSync(plano).toString("utf8"));
  for (const a of manifiesto.archivos) {
    if (sha256(Buffer.from(a.datos, "base64")) !== a.sha256) throw new Error(`Copia dañada: ${a.ruta}`);
    if (!rutaSegura(a.ruta)) throw new Error(`Ruta no permitida en la copia: ${a.ruta}`);
  }
  return manifiesto;
}

/**
 * Restaura los archivos de un manifiesto en el vault.
 * Sin `forzar`, no sobrescribe archivos locales más recientes que los de la copia.
 * Devuelve { restaurados, sinCambios, omitidos }.
 */
export function restaurar(vault, manifiesto, { forzar = false } = {}) {
  const res = { restaurados: [], sinCambios: [], omitidos: [] };
  for (const a of manifiesto.archivos) {
    const abs = path.join(vault, ...a.ruta.split("/"));
    const datos = Buffer.from(a.datos, "base64");
    if (fs.existsSync(abs)) {
      const local = fs.readFileSync(abs);
      if (sha256(local) === a.sha256) { res.sinCambios.push(a.ruta); continue; }
      if (!forzar && fs.statSync(abs).mtimeMs > a.mtime + 1000) { res.omitidos.push(a.ruta); continue; }
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    escribirAtomico(abs, datos);
    const t = new Date(a.mtime);
    fs.utimesSync(abs, t, t);
    res.restaurados.push(a.ruta);
  }
  return res;
}

/** Nombre de archivo para una copia hecha en `fecha` (hora local). */
export function nombreCopia(fecha = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `cerebrojm-${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}_${p(fecha.getHours())}${p(fecha.getMinutes())}${p(fecha.getSeconds())}.cjmbak`;
}

/** Copias de CerebroJM en una carpeta, de la más antigua a la más reciente. */
export function listarCopias(destino) {
  try { return fs.readdirSync(destino).filter((n) => PATRON_COPIA.test(n)).sort(); } catch { return []; }
}

/** Borra las copias más antiguas y conserva las `n` últimas. Solo toca archivos con el patrón propio. */
export function aplicarRetencion(destino, n = RETENCION) {
  const copias = listarCopias(destino);
  const borrar = copias.slice(0, Math.max(0, copias.length - n));
  for (const c of borrar) fs.unlinkSync(path.join(destino, c));
  return borrar;
}

/** Pide una contraseña sin mostrarla en pantalla. */
export async function preguntarOculto(texto) {
  const entrada = process.stdin;
  if (!entrada.isTTY) throw new Error("No hay terminal interactiva: usa --password-env NOMBRE_VARIABLE.");
  process.stdout.write(texto);
  entrada.setRawMode(true);
  entrada.resume();
  entrada.setEncoding("utf8");
  return new Promise((resolver, rechazar) => {
    let valor = "";
    const alPulsar = (c) => {
      for (const ch of c) {
        if (ch === "\r" || ch === "\n") {
          entrada.setRawMode(false); entrada.pause(); entrada.off("data", alPulsar);
          process.stdout.write("\n");
          return resolver(valor);
        }
        if (ch === "\u0003") { entrada.setRawMode(false); process.stdout.write("\n"); return rechazar(new Error("Cancelado.")); }
        if (ch === "\u0008" || ch === "\u007f") valor = valor.slice(0, -1);
        else valor += ch;
      }
    };
    entrada.on("data", alPulsar);
  });
}

/** Lee la contraseña de una variable de entorno (para pruebas/automatización) o la pide oculta. */
export async function obtenerPassword(args, texto) {
  const i = args.indexOf("--password-env");
  if (i >= 0) {
    const v = process.env[args[i + 1]];
    if (!v) throw new Error(`La variable ${args[i + 1]} está vacía.`);
    return v;
  }
  return preguntarOculto(texto);
}
