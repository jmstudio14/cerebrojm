// Escritura atómica (archivo temporal y renombrado) con reintento: en Windows, Obsidian,
// el antivirus o la nube pueden bloquear un instante el archivo y `rename` falla con
// EPERM/EBUSY/EACCES.
import fs from "node:fs";

const BLOQUEO = new Set(["EPERM", "EBUSY", "EACCES"]);
const esperar = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function escribirAtomico(ruta, contenido, { renombrar = fs.renameSync, intentos = 5 } = {}) {
  const tmp = ruta + ".tmp";
  fs.writeFileSync(tmp, contenido);
  for (let i = 1; ; i++) {
    try { return renombrar(tmp, ruta); }
    catch (e) {
      if (!BLOQUEO.has(e.code) || i >= intentos) { fs.rmSync(tmp, { force: true }); throw e; }
      esperar(50 * i);
    }
  }
}
