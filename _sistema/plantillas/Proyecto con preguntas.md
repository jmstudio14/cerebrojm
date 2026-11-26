<%*
// Plantilla de Templater: pregunta los campos y rellena `Proyecto.md`, que sigue siendo la única definición.
const hoy = tp.date.now("YYYY-MM-DD");
const elegir = (opciones, texto) => tp.system.suggester(opciones, opciones, true, texto);
// Templater solo muestra «Template parsing error»: el motivo va en un aviso aparte.
const fallar = (motivo) => { new tp.obsidian.Notice(motivo, 10000); throw new Error(motivo); };
const sinNombre = /^(Sin título|Untitled)( \d+)?$/.test(tp.file.title);

const titulo = (await tp.system.prompt("Nombre del proyecto", sinNombre ? "" : tp.file.title, true)).trim();
const nombre = titulo.replace(/[\\/:*?"<>|#^\[\]]/g, "").replace(/^\.+/, "").trim();
if (!nombre) fallar("Falta un nombre válido para el proyecto");

const categoria = await elegir(["codigo", "personal", "creativo"], "Categoría");
const estado = await elegir(["idea", "activo", "pausado", "bloqueado", "completado", "archivado"], "Estado");
const prioridad = await elegir(["media", "alta", "baja"], "Prioridad");
const proxima = (await tp.system.prompt("Próxima acción (puede quedar vacía)", "", true)).trim();

const destino = `01 Proyectos/${nombre}`;
const mover = tp.file.path(true) !== `${destino}.md`;
if (mover && tp.app.vault.getAbstractFileByPath(`${destino}.md`)) fallar(`Ya existe ${destino}.md`);

const base = await tp.app.vault.cachedRead(tp.app.vault.getAbstractFileByPath("_sistema/plantillas/Proyecto.md"));
const campo = (texto, clave, valor) => texto.replace(new RegExp(`^${clave}: .*$`, "m"), () => `${clave}: ${valor}`);
let nota = base.replace(/\r\n/g, "\n").replace(/\{\{date\}\}/g, () => hoy).replace(/\{\{title\}\}/g, () => titulo);
nota = campo(nota, "categoria", categoria);
nota = campo(nota, "estado", estado);
nota = campo(nota, "prioridad", prioridad);
nota = campo(nota, "proxima_accion", JSON.stringify(proxima));

if (mover) await tp.file.move(destino);
tR += nota;
-%>
