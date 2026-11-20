// Agenda para el Panel: eventos de Google Calendar (iCal) + fechas límite de proyectos.
// Uso en una nota:  ```dataviewjs
//                   await dv.view("_sistema/scripts/agenda", { dias: 7 })
//                   ```
// La URL secreta iCal NO está en el repo: se lee de la configuración local del
// plugin Full Calendar (.obsidian/plugins/obsidian-full-calendar/data.json, ignorado por Git).

const CONFIG_FC = ".obsidian/plugins/obsidian-full-calendar/data.json";
const CARPETA_PROYECTOS = "01 Proyectos";

// ---------- Parser iCal mínimo (con recurrencias habituales) ----------

function desplegarLineas(texto) {
  return texto.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function parsearPropiedad(linea) {
  const i = linea.indexOf(":");
  if (i < 0) return null;
  const cabecera = linea.slice(0, i);
  const valor = linea.slice(i + 1);
  const [nombre, ...ps] = cabecera.split(";");
  const params = {};
  for (const p of ps) {
    const [k, v] = p.split("=");
    params[k.toUpperCase()] = (v || "").replace(/"/g, "");
  }
  return { nombre: nombre.toUpperCase(), params, valor };
}

function desescapar(s) {
  return (s || "").replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

// Desfase (ms) de una zona horaria IANA en un instante dado.
function desfaseZona(tz, instante) {
  try {
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const p = Object.fromEntries(f.formatToParts(new Date(instante)).map((x) => [x.type, x.value]));
    const comoUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return comoUTC - instante;
  } catch (e) {
    return -new Date(instante).getTimezoneOffset() * 60000;
  }
}

function parsearFecha(prop) {
  if (!prop) return null;
  const v = prop.valor.trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, Y, M, D, h, mi, s, z] = m;
  if (!h) return { fecha: new Date(+Y, +M - 1, +D), todoElDia: true };
  if (z) return { fecha: new Date(Date.UTC(+Y, +M - 1, +D, +h, +mi, +s)), todoElDia: false };
  const tz = prop.params.TZID;
  if (tz) {
    const aprox = Date.UTC(+Y, +M - 1, +D, +h, +mi, +s);
    let t = aprox - desfaseZona(tz, aprox);
    t = aprox - desfaseZona(tz, t); // segunda pasada por cambios de horario
    return { fecha: new Date(t), todoElDia: false };
  }
  return { fecha: new Date(+Y, +M - 1, +D, +h, +mi, +s), todoElDia: false };
}

const claveDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function parsearICS(texto) {
  const eventos = [];
  let actual = null;
  for (const linea of desplegarLineas(texto)) {
    if (linea === "BEGIN:VEVENT") { actual = { exdates: [], exdias: [] }; continue; }
    if (linea === "END:VEVENT") { if (actual) eventos.push(actual); actual = null; continue; }
    if (!actual) continue;
    const p = parsearPropiedad(linea);
    if (!p) continue;
    switch (p.nombre) {
      case "UID": actual.uid = p.valor; break;
      case "SUMMARY": actual.titulo = desescapar(p.valor); break;
      case "LOCATION": actual.lugar = desescapar(p.valor); break;
      case "STATUS": actual.estado = p.valor.toUpperCase(); break;
      case "DTSTART": actual.inicio = parsearFecha(p); break;
      case "DTEND": actual.fin = parsearFecha(p); break;
      case "RRULE": actual.rrule = p.valor; break;
      case "RECURRENCE-ID": actual.recurrenceId = parsearFecha(p); break;
      case "EXDATE":
        for (const v of p.valor.split(",")) {
          const f = parsearFecha({ params: p.params, valor: v });
          // EXDATE;VALUE=DATE excluye el día entero, también en series con hora.
          if (f) (f.todoElDia ? actual.exdias.push(claveDia(f.fecha)) : actual.exdates.push(f.fecha.getTime()));
        }
        break;
    }
  }
  return eventos.filter((e) => e.inicio);
}

const DIAS_ICS = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function conHora(base, dia) {
  const d = new Date(dia);
  d.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
  return d;
}

function nEsimoDiaSemana(anio, mes, diaSemana, n) {
  if (n > 0) {
    const primero = new Date(anio, mes, 1);
    const offset = (diaSemana - primero.getDay() + 7) % 7;
    const d = new Date(anio, mes, 1 + offset + (n - 1) * 7);
    return d.getMonth() === mes ? d : null;
  }
  const ultimo = new Date(anio, mes + 1, 0);
  const offset = (ultimo.getDay() - diaSemana + 7) % 7;
  const d = new Date(anio, mes, ultimo.getDate() - offset + (n + 1) * 7);
  return d.getMonth() === mes ? d : null;
}

// Devuelve los inicios (Date) de las ocurrencias que caen en [desde, hasta).
function expandir(ev, desde, hasta) {
  const inicio = ev.inicio.fecha;
  if (!ev.rrule) return inicio < hasta ? [inicio] : [];
  const r = Object.fromEntries(ev.rrule.split(";").map((x) => x.split("=")));
  const freq = r.FREQ;
  const intervalo = parseInt(r.INTERVAL || "1", 10);
  const cuenta = r.COUNT ? parseInt(r.COUNT, 10) : Infinity;
  // Un UNTIL mal formado se ignora (la serie sigue): lanzar aquí rompería toda la agenda.
  const hastaRegla = r.UNTIL ? (parsearFecha({ params: {}, valor: r.UNTIL })?.fecha ?? null) : null;
  const byday = r.BYDAY ? r.BYDAY.split(",") : null;
  const limite = hastaRegla && hastaRegla < hasta ? new Date(hastaRegla.getTime() + 1) : hasta;

  const out = [];
  let n = 0;
  const empujar = (d) => {
    if (d < inicio) return true;
    if (d >= limite || n >= cuenta) return false;
    n++;
    if (d >= desde) out.push(d);
    return true;
  };

  const sinExcluidos = (xs) => xs.filter((d) => !ev.exdates.includes(d.getTime()) && !ev.exdias.includes(claveDia(d)));
  // DAILY sin COUNT: se salta a cerca de `desde` (con el tope de pasos, una serie de hace años desaparecería).
  const pasoIni = freq === "DAILY" && cuenta === Infinity ? Math.max(0, Math.floor((desde - inicio) / (86400000 * intervalo)) - 2) : 0;
  for (let paso = pasoIni; paso < pasoIni + 5000; paso++) {
    let candidatos = [];
    if (freq === "DAILY") {
      const d = new Date(inicio); d.setDate(d.getDate() + paso * intervalo);
      candidatos = [d];
    } else if (freq === "WEEKLY") {
      const lunes = new Date(inicio);
      lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7) + paso * 7 * intervalo);
      const dias = byday ? byday.map((b) => DIAS_ICS[b.slice(-2)]) : [inicio.getDay()];
      candidatos = dias
        .map((dw) => { const d = new Date(lunes); d.setDate(d.getDate() + ((dw + 6) % 7)); return conHora(inicio, d); })
        .sort((a, b) => a - b);
    } else if (freq === "MONTHLY") {
      const base = new Date(inicio.getFullYear(), inicio.getMonth() + paso * intervalo, 1);
      if (byday) {
        candidatos = byday.map((b) => {
          const m = b.match(/^([+-]?\d+)?([A-Z]{2})$/);
          const nth = m && m[1] ? parseInt(m[1], 10) : (r.BYSETPOS ? parseInt(r.BYSETPOS, 10) : 1);
          const d = nEsimoDiaSemana(base.getFullYear(), base.getMonth(), DIAS_ICS[m[2]], nth);
          return d && conHora(inicio, d);
        }).filter(Boolean).sort((a, b) => a - b);
      } else {
        const dia = r.BYMONTHDAY ? parseInt(r.BYMONTHDAY, 10) : inicio.getDate();
        const d = new Date(base.getFullYear(), base.getMonth(), dia);
        if (d.getMonth() === base.getMonth()) candidatos = [conHora(inicio, d)];
      }
    } else if (freq === "YEARLY") {
      const d = new Date(inicio); d.setFullYear(inicio.getFullYear() + paso * intervalo);
      if (d.getMonth() === inicio.getMonth()) candidatos = [d];
    } else {
      return inicio >= desde && inicio < hasta ? [inicio] : [];
    }
    for (const c of candidatos) if (!empujar(c)) return sinExcluidos(out);
  }
  return sinExcluidos(out);
}

function ocurrencias(eventos, desde, hasta) {
  const reemplazos = new Set(
    eventos.filter((e) => e.recurrenceId).map((e) => `${e.uid}|${e.recurrenceId.fecha.getTime()}`)
  );
  const res = [];
  for (const ev of eventos) {
    if (ev.estado === "CANCELLED") continue;
    const dur = ev.fin ? ev.fin.fecha - ev.inicio.fecha : (ev.inicio.todoElDia ? 86400000 : 0);
    const inicios = ev.recurrenceId ? [ev.inicio.fecha] : expandir(ev, new Date(desde.getTime() - dur), hasta);
    for (const ini of inicios) {
      if (!ev.recurrenceId && ev.rrule && reemplazos.has(`${ev.uid}|${ini.getTime()}`)) continue;
      const fin = new Date(ini.getTime() + dur);
      const solapa = ev.inicio.todoElDia ? fin > desde && ini < hasta : (fin > desde || ini >= desde) && ini < hasta;
      if (solapa) res.push({ titulo: ev.titulo || "(sin título)", lugar: ev.lugar, inicio: ini, fin, todoElDia: ev.inicio.todoElDia });
    }
  }
  return res.sort((a, b) => a.inicio - b.inicio);
}

// ---------- Utilidades ----------

// Escapa caracteres con significado en Markdown/HTML para que un título de
// evento no pueda alterar el formato de la nota.
function escaparMd(texto) {
  return String(texto ?? "")
    .replace(/[\\`*_{}\[\]()#+!|<>~=]/g, (c) => "\\" + c)
    .replace(/\s+/g, " ")
    .trim();
}

// requestUrl de Obsidian evita el bloqueo CORS de Google. Puede estar como
// global o solo en el módulo "obsidian"; si no aparece, se devuelve null.
function obtenerRequestUrl() {
  if (typeof globalThis.requestUrl === "function") return globalThis.requestUrl;
  try {
    const r = (typeof require === "function" ? require : globalThis.require)("obsidian").requestUrl;
    if (typeof r === "function") return r;
  } catch (e) { /* no disponible */ }
  return null;
}

// Clave de caché sin guardar la URL secreta en claro.
function claveCache(url) {
  let h = 5381;
  for (let i = 0; i < url.length; i++) h = ((h * 33) ^ url.charCodeAt(i)) >>> 0;
  return "cerebrojm-ical-" + h.toString(36);
}

// ---------- Exportación para pruebas fuera de Obsidian ----------
if (typeof module !== "undefined" && typeof dv === "undefined") {
  module.exports = { parsearICS, ocurrencias, escaparMd, obtenerRequestUrl, claveCache };
}

// ---------- Render en Obsidian ----------
if (typeof dv !== "undefined") {
  return (async () => {
    const dias = (typeof input !== "undefined" && input && input.dias) || 7;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const hasta = new Date(hoy); hasta.setDate(hasta.getDate() + dias);

    // 1) URLs iCal desde la config local de Full Calendar
    const items = [];
    const avisos = [];
    let fuentes = [];
    let textoCfg = null;
    let cfgIlegible = false;
    try { textoCfg = await dv.app.vault.adapter.read(CONFIG_FC); } catch (e) { /* sin configurar todavía */ }
    if (textoCfg !== null) {
      try { fuentes = (JSON.parse(textoCfg).calendarSources || []).filter((s) => s.type === "ical" && s.url); }
      catch (e) {
        cfgIlegible = true;
        avisos.push(`> [!warning] La configuración de Full Calendar (\`${CONFIG_FC}\`) no es un JSON válido y no se puede leer: ${escaparMd(e.message)}`);
      }
    }

    const req = obtenerRequestUrl();
    if (fuentes.length && !req) {
      avisos.push("> [!warning] `requestUrl` de Obsidian no está disponible: no se puede descargar el calendario. Abre [[Diagnóstico]].");
    }
    for (const f of fuentes) {
      const url = f.url.replace(/^webcal:/i, "https:");
      const clave = claveCache(url);
      let texto = null;
      try {
        if (!req) throw new Error("requestUrl no disponible");
        texto = (await req({ url })).text;
        if (!/BEGIN:VCALENDAR/.test(texto)) throw new Error("la respuesta no es un calendario iCal");
        try { localStorage.setItem(clave, JSON.stringify({ t: Date.now(), texto })); } catch (e) { /* caché llena */ }
      } catch (e) {
        let copia = null;
        try { copia = JSON.parse(localStorage.getItem(clave) || "null"); } catch (e2) { /* sin caché */ }
        if (copia && copia.texto) {
          texto = copia.texto;
          const cuando = new Date(copia.t).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
          avisos.push(`> [!info] Sin conexión con un calendario: se muestran los datos guardados del ${cuando}.`);
        } else {
          avisos.push(`> [!warning] No se pudo leer un calendario: ${escaparMd(e.message || String(e))}`);
        }
      }
      if (texto) {
        for (const o of ocurrencias(parsearICS(texto), hoy, hasta)) items.push({ ...o, color: f.color, tipo: "evento" });
      }
    }

    // 2) Fechas límite de proyectos abiertos
    for (const p of dv.pages(`"${CARPETA_PROYECTOS}"`).where((p) => p.tipo === "proyecto" && p.fecha_limite && !["completado", "archivado"].includes(p.estado))) {
      const d = new Date(p.fecha_limite.toJSDate ? p.fecha_limite.toJSDate() : p.fecha_limite);
      d.setHours(0, 0, 0, 0);
      // «Vencido» solo cuenta en activo y bloqueado, como en el Panel (00 Panel.md) y estado.mjs.
      if (d < hoy && !["activo", "bloqueado"].includes(p.estado)) continue;
      if (d < hasta) items.push({ titulo: p.file.link, inicio: d < hoy ? hoy : d, todoElDia: true, tipo: "limite", vencido: d < hoy, fechaReal: d });
    }

    if (!fuentes.length && !cfgIlegible) {
      dv.paragraph("> [!info] Calendario sin conectar\n> Ajustes → Full Calendar → *Add calendar* → **iCal** y pega la *dirección secreta en formato iCal* de Google Calendar. Ver `README.md`.");
    }
    for (const a of avisos) dv.paragraph(a);
    if (!items.length) { dv.paragraph(`*Nada en los próximos ${dias} días.*`); return; }

    const fmtHora = (d) => d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const claveDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
    const nombreDia = (t) => {
      const diff = Math.round((t - hoy.getTime()) / 86400000);
      if (diff === 0) return "Hoy";
      if (diff === 1) return "Mañana";
      const s = new Date(t).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const grupos = new Map();
    for (const it of items) {
      const k = Math.max(claveDia(it.inicio), hoy.getTime());
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(it);
    }
    for (const k of [...grupos.keys()].sort((a, b) => a - b)) {
      const lista = grupos.get(k).sort((a, b) => (b.todoElDia - a.todoElDia) || (a.inicio - b.inicio));
      dv.header(4, nombreDia(k));
      dv.list(lista.map((it) => {
        if (it.tipo === "limite") {
          return it.vencido
            ? `⚠️ **Vencido** (${it.fechaReal.toLocaleDateString("es-ES")}): ${it.titulo}`
            : `🎯 Fecha límite: ${it.titulo}`;
        }
        const hora = it.todoElDia ? "Todo el día" : `${fmtHora(it.inicio)}–${fmtHora(it.fin)}`;
        return `📅 ${hora} · **${escaparMd(it.titulo)}**${it.lugar ? ` · _${escaparMd(it.lugar)}_` : ""}`;
      }));
    }
  })();
}
