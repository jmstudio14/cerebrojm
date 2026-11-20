// Tests de la copia de seguridad cifrada (FEAT-002 / ADR-0001).
// Ejecutar: node --test _sistema/tests/respaldo.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MAGIA, recogerArchivos, crearCopia, leerCopia, restaurar, aplicarRetencion, listarCopias, rutaSegura } from "../scripts/respaldo-lib.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const RESPALDAR = path.join(RAIZ, "_sistema", "scripts", "respaldar.mjs");
const RESTAURAR = path.join(RAIZ, "_sistema", "scripts", "restaurar.mjs");
const PWD = "contraseña de prueba";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-respaldo-"));
const vault = path.join(tmp, "vault");
const destino = path.join(tmp, "copias");
const escribir = (rel, txt) => { const f = path.join(vault, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(vault, rel))).digest("hex");

// Zona personal
escribir("01 Proyectos/Proyecto A.md", "---\ntipo: proyecto\nestado: activo\n---\n# A\n");
escribir("02 Notas/Bandeja de entrada.md", "- idea\n");
escribir("03 Diario/2026-11-18.md", "# Hoy\n");
escribir("04 Revisiones/2026-11-18.md", "# Revisión\n");
escribir("05 Herramientas/Skill X.md", "# X\n");
escribir("_sistema/adjuntos/captura.png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]));
escribir("_sistema/config/escaner.local.json", '{"carpetas":["C:\\\\x"]}');
// Sistema (no debe entrar en la copia)
escribir("01 Proyectos/_Índice de proyectos.md", "# Índice\n");
escribir("03 Diario/.gitkeep", "");
escribir("00 Panel.md", "# Panel\n");
escribir("_sistema/scripts/agenda.js", "// código\n");
escribir("_sistema/config/escaner.ejemplo.json", "{}");

const PERSONALES = [
  "01 Proyectos/Proyecto A.md", "02 Notas/Bandeja de entrada.md", "03 Diario/2026-11-18.md",
  "04 Revisiones/2026-11-18.md", "05 Herramientas/Skill X.md", "_sistema/adjuntos/captura.png",
  "_sistema/config/escaner.local.json",
];

test("recoge exactamente la zona personal (sin índices, .gitkeep ni archivos del sistema)", () => {
  assert.deepEqual(recogerArchivos(vault), [...PERSONALES].sort());
});

test("ida y vuelta: respaldar, borrar y restaurar reproduce los archivos byte a byte", () => {
  const antes = Object.fromEntries(PERSONALES.map((r) => [r, hash(r)]));
  const { buffer, total } = crearCopia(vault, PWD);
  assert.equal(total, PERSONALES.length);
  for (const r of PERSONALES) fs.rmSync(path.join(vault, r));
  const res = restaurar(vault, leerCopia(buffer, PWD));
  assert.equal(res.restaurados.length, PERSONALES.length);
  for (const r of PERSONALES) assert.equal(hash(r), antes[r], r);
});

test("la copia está cifrada: no contiene texto legible de las notas", () => {
  const { buffer } = crearCopia(vault, PWD);
  assert.ok(!buffer.includes(Buffer.from("tipo: proyecto")));
  assert.ok(!buffer.includes(Buffer.from("Proyecto A")));
});

test("contraseña incorrecta: error claro y no se escribe nada", () => {
  const { buffer } = crearCopia(vault, PWD);
  assert.throws(() => leerCopia(buffer, "otra"), /Contraseña incorrecta/);
  const dañada = Buffer.from(buffer); dañada[dañada.length - 1] ^= 0xff;
  assert.throws(() => leerCopia(dañada, PWD), /Contraseña incorrecta o copia dañada/);
  assert.throws(() => leerCopia(Buffer.from("no es una copia"), PWD), /No es una copia/);
});

test("restaurar no pisa un archivo local más reciente; con forzar, sí", () => {
  const { buffer } = crearCopia(vault, PWD);
  const ruta = "01 Proyectos/Proyecto A.md";
  const abs = path.join(vault, ruta);
  fs.writeFileSync(abs, "versión local más nueva\n");
  const futuro = new Date(Date.now() + 60_000); fs.utimesSync(abs, futuro, futuro);
  const m = leerCopia(buffer, PWD);
  const r1 = restaurar(vault, m);
  assert.ok(r1.omitidos.includes(ruta));
  assert.equal(fs.readFileSync(abs, "utf8"), "versión local más nueva\n");
  const r2 = restaurar(vault, m, { forzar: true });
  assert.ok(r2.restaurados.includes(ruta));
  assert.match(fs.readFileSync(abs, "utf8"), /tipo: proyecto/);
  const r3 = restaurar(vault, m);
  assert.equal(r3.restaurados.length, 0, "una segunda restauración no cambia nada");
});

test("retención: conserva las 10 últimas copias y no toca otros archivos", () => {
  const dir = path.join(tmp, "retencion");
  fs.mkdirSync(dir);
  for (let i = 1; i <= 12; i++) fs.writeFileSync(path.join(dir, `cerebrojm-2026-01-${String(i).padStart(2, "0")}_120000.cjmbak`), "x");
  fs.writeFileSync(path.join(dir, "otro-archivo.zip"), "y");
  const borradas = aplicarRetencion(dir, 10);
  assert.deepEqual(borradas, ["cerebrojm-2026-01-01_120000.cjmbak", "cerebrojm-2026-01-02_120000.cjmbak"]);
  assert.equal(listarCopias(dir).length, 10);
  assert.ok(fs.existsSync(path.join(dir, "otro-archivo.zip")));
});

test("CLI: respaldar y restaurar de punta a punta, y registro de la fecha de la última copia", () => {
  const env = { ...process.env, CJM_PWD: PWD };
  const out = execFileSync(process.execPath, [RESPALDAR, "--vault", vault, "--destino", destino, "--password-env", "CJM_PWD"], { env, encoding: "utf8" });
  assert.match(out, /Copia creada/);
  assert.match(out, /7 archivos/);
  const cfg = JSON.parse(fs.readFileSync(path.join(vault, "_sistema/config/respaldo.local.json"), "utf8"));
  assert.equal(path.resolve(cfg.destino), path.resolve(destino));
  assert.ok(!Number.isNaN(Date.parse(cfg.ultimo)));
  fs.rmSync(path.join(vault, "03 Diario/2026-11-18.md"));
  const out2 = execFileSync(process.execPath, [RESTAURAR, "--vault", vault, "--password-env", "CJM_PWD"], { env, encoding: "utf8" });
  assert.match(out2, /1 restaurados/);
  assert.ok(fs.existsSync(path.join(vault, "03 Diario/2026-11-18.md")));
  assert.throws(() => execFileSync(process.execPath, [RESTAURAR, "--vault", vault, "--password-env", "MAL"], { env: { ...env, MAL: "x" }, stdio: "pipe" }));
});

test("rutaSegura acepta nombres con puntos suspensivos y rechaza segmentos .. y rutas absolutas", () => {
  for (const ok of ["02 Notas/Ideas... sueltas.md", "02 Notas/a..b.md", "01 Proyectos/..oculto.md"]) assert.ok(rutaSegura(ok), ok);
  for (const mal of ["../x", "a/../../x", "a\\..\\..\\x", path.resolve("/etc/x")]) assert.ok(!rutaSegura(mal), mal);
});

test("una copia con una nota llamada 'Ideas... sueltas.md' se lee y se restaura", () => {
  escribir("02 Notas/Ideas... sueltas.md", "puntos\n");
  const { buffer } = crearCopia(vault, PWD);
  fs.rmSync(path.join(vault, "02 Notas/Ideas... sueltas.md"));
  assert.ok(restaurar(vault, leerCopia(buffer, PWD)).restaurados.includes("02 Notas/Ideas... sueltas.md"));
  fs.rmSync(path.join(vault, "02 Notas/Ideas... sueltas.md"));
});

test("CLI: un destino dentro del vault se rechaza y no crea la carpeta", () => {
  const dentro = path.join(vault, "copias-dentro");
  const env = { ...process.env, CJM_PWD: PWD };
  assert.throws(
    () => execFileSync(process.execPath, [RESPALDAR, "--vault", vault, "--destino", dentro, "--password-env", "CJM_PWD"], { env, stdio: "pipe" }),
    (e) => /dentro del vault/.test(String(e.stderr)),
  );
  assert.ok(!fs.existsSync(dentro));
});

test("CLI: un respaldo.local.json mal formado se rechaza y no se sobrescribe", () => {
  const cfg = path.join(vault, "_sistema/config/respaldo.local.json");
  const original = fs.readFileSync(cfg, "utf8");
  fs.writeFileSync(cfg, "{ roto");
  const env = { ...process.env, CJM_PWD: PWD };
  assert.throws(
    () => execFileSync(process.execPath, [RESPALDAR, "--vault", vault, "--destino", destino, "--password-env", "CJM_PWD"], { env, stdio: "pipe" }),
    (e) => /no es JSON válido/.test(String(e.stderr)),
  );
  assert.equal(fs.readFileSync(cfg, "utf8"), "{ roto");
  fs.writeFileSync(cfg, original);
});

// --- Copia incompleta: lo que no se puede leer se avisa, no se omite en silencio ---
function vaultIncompleto() {
  const v = fs.mkdtempSync(path.join(tmp, "incompleto-"));
  fs.mkdirSync(path.join(v, "02 Notas"));
  fs.writeFileSync(path.join(v, "02 Notas", "Nota.md"), "# Nota\n");
  fs.writeFileSync(path.join(v, "03 Diario"), "esto debería ser una carpeta"); // readdir falla con ENOTDIR
  return v;
}

test("una carpeta ilegible se anota en omitidos y el resto sí entra en la copia", () => {
  const { total, omitidos } = crearCopia(vaultIncompleto(), PWD);
  assert.equal(total, 1);
  assert.equal(omitidos.length, 1);
  assert.match(omitidos[0], /03 Diario.*ENOTDIR/);
});

test("un enlace simbólico se anota en omitidos", (t) => {
  const v = vaultIncompleto();
  try { fs.symlinkSync(path.join(v, "02 Notas", "Nota.md"), path.join(v, "02 Notas", "enlace.md")); }
  catch { return t.skip("este sistema no permite crear enlaces simbólicos sin privilegios"); }
  assert.ok(crearCopia(v, PWD).omitidos.some((o) => /enlace\.md.*enlace simbólico/.test(o)));
});

test("CLI: una copia incompleta se crea, avisa de lo omitido y sale con código 1", () => {
  const v = vaultIncompleto();
  const dest = path.join(tmp, "copias-incompletas");
  const r = spawnSync(process.execPath, [RESPALDAR, "--vault", v, "--destino", dest, "--password-env", "CJM_PWD"],
    { env: { ...process.env, CJM_PWD: PWD }, encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /1 entrada omitida.*03 Diario/s);
  assert.equal(fs.readdirSync(dest).length, 1, "la copia se crea igualmente");
});

// Copia válida cuyo manifiesto se altera antes de volver a cifrarla (mismos parámetros scrypt que respaldo-lib).
function copiaAlterada(buffer, alterar) {
  const clave = (sal) => crypto.scryptSync(PWD, sal, 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const sal = buffer.subarray(MAGIA.length, MAGIA.length + 16);
  const iv = buffer.subarray(MAGIA.length + 16, MAGIA.length + 28);
  const descifrador = crypto.createDecipheriv("aes-256-gcm", clave(sal), iv);
  descifrador.setAuthTag(buffer.subarray(MAGIA.length + 28, MAGIA.length + 44));
  const plano = Buffer.concat([descifrador.update(buffer.subarray(MAGIA.length + 44)), descifrador.final()]);
  const manifiesto = JSON.parse(zlib.gunzipSync(plano).toString("utf8"));
  alterar(manifiesto);
  const cifrador = crypto.createCipheriv("aes-256-gcm", clave(sal), iv);
  const cifrado = Buffer.concat([cifrador.update(zlib.gzipSync(Buffer.from(JSON.stringify(manifiesto)))), cifrador.final()]);
  return Buffer.concat([MAGIA, sal, iv, cifrador.getAuthTag(), cifrado]);
}

test("una copia con un sha256 que no cuadra se rechaza como dañada", () => {
  const { buffer } = crearCopia(vault, PWD);
  const mala = copiaAlterada(buffer, (m) => { m.archivos[0].sha256 = "0".repeat(64); });
  assert.throws(() => leerCopia(mala, PWD), /Copia dañada: /);
});

test("una copia con una ruta que sale del vault se rechaza y no escribe nada", () => {
  const { buffer } = crearCopia(vault, PWD);
  const mala = copiaAlterada(buffer, (m) => { m.archivos[0].ruta = "../fuera.md"; });
  assert.throws(() => leerCopia(mala, PWD), /Ruta no permitida en la copia: \.\.\/fuera\.md/);
  assert.ok(!fs.existsSync(path.join(tmp, "fuera.md")));
});

test("los archivos .tmp de la zona personal no entran en la copia", () => {
  escribir("02 Notas/Nota.md.tmp", "a medias\n");
  const archivos = recogerArchivos(vault);
  fs.rmSync(path.join(vault, "02 Notas/Nota.md.tmp"));
  assert.ok(!archivos.some((r) => r.endsWith(".tmp")));
  assert.ok(archivos.includes("02 Notas/Bandeja de entrada.md"));
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
