// Tests del lector iCal de la agenda. Ejecutar: node --test _sistema/tests/agenda.test.js
// TZ fija para que el resultado no dependa del equipo.
process.env.TZ = "Europe/Madrid";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parsearICS, ocurrencias, escaparMd, claveCache } = require("../scripts/agenda.js");

const ics = fs.readFileSync(path.join(__dirname, "fixtures", "calendario.ics"), "utf8");
const eventos = parsearICS(ics);
const lista = ocurrencias(eventos, new Date(2026, 10, 18), new Date(2026, 11, 10));
const fmt = (o) => `${o.inicio.toISOString()} ${o.titulo}`;
const titulos = lista.map((o) => o.titulo);

test("evento simple con TZID y lugar escapado de iCal", () => {
  const e = lista.find((o) => o.titulo === "Reunión simple");
  assert.equal(e.inicio.toISOString(), "2026-11-18T09:00:00.000Z");
  assert.equal(e.lugar, "Oficina, sala 2");
});

test("semanal con BYDAY respeta EXDATE e instancia movida", () => {
  const standups = lista.filter((o) => o.titulo === "Standup").map((o) => o.inicio.toISOString().slice(0, 10));
  assert.deepEqual(standups, ["2026-11-26", "2026-11-30", "2026-12-03", "2026-12-07"]);
  assert.ok(!standups.includes("2026-11-23"), "EXDATE excluido");
  const movido = lista.find((o) => o.titulo === "Standup (movido)");
  assert.equal(movido.inicio.toISOString(), "2026-11-19T11:00:00.000Z");
});

test("mensual el segundo martes", () => {
  const club = lista.filter((o) => o.titulo === "Club mensual");
  assert.equal(club.length, 1);
  assert.equal(club[0].inicio.toISOString(), "2026-12-08T17:00:00.000Z");
});

test("anual de día completo", () => {
  const c = lista.find((o) => o.titulo === "Cumpleaños");
  assert.ok(c.todoElDia);
  assert.equal(c.inicio.getDate(), 20);
});

test("cancelados y recurrencias agotadas (COUNT) no aparecen", () => {
  assert.ok(!titulos.includes("Cancelado"));
  assert.ok(!titulos.includes("Viejo con COUNT"));
});

test("orden cronológico", () => {
  const t = lista.map((o) => o.inicio.getTime());
  assert.deepEqual(t, [...t].sort((a, b) => a - b), lista.map(fmt).join("\n"));
});

test("escaparMd neutraliza Markdown y HTML", () => {
  assert.equal(escaparMd("*a* [b](c) <i>"), "\\*a\\* \\[b\\]\\(c\\) \\<i\\>");
  assert.equal(escaparMd(undefined), "");
});

test("la clave de caché no contiene la URL secreta", () => {
  const url = "https://calendar.google.com/calendar/ical/secreto/private-abc/basic.ics";
  const k = claveCache(url);
  assert.ok(!k.includes("secreto") && !k.includes("abc"));
  assert.equal(k, claveCache(url));
});

// --- Robustez (auditoría 2026-11-20) ---
const evento = (...lineas) => ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:u@test", "SUMMARY:Prueba", ...lineas, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
const dias = (ics, desde, hasta) => ocurrencias(parsearICS(ics), desde, hasta).map((o) => o.inicio.toISOString().slice(0, 10));

test("un UNTIL mal formado no rompe la agenda: se ignora el límite", () => {
  const ics = evento("DTSTART:20261118T100000Z", "RRULE:FREQ=DAILY;UNTIL=basura");
  assert.deepEqual(dias(ics, new Date(2026, 10, 18), new Date(2026, 10, 21)), ["2026-11-18", "2026-11-19", "2026-11-20"]);
});

test("un UNTIL válido corta la serie en esa fecha, incluida", () => {
  const ics = evento("DTSTART:20261116T100000Z", "RRULE:FREQ=DAILY;UNTIL=20261118T100000Z");
  assert.deepEqual(dias(ics, new Date(2026, 10, 16), new Date(2026, 10, 25)), ["2026-11-16", "2026-11-17", "2026-11-18"]);
});

test("MONTHLY con BYMONTHDAY cae ese día de cada mes", () => {
  const ics = evento("DTSTART:20260910T100000Z", "RRULE:FREQ=MONTHLY;BYMONTHDAY=15");
  assert.deepEqual(dias(ics, new Date(2026, 9, 1), new Date(2027, 0, 1)), ["2026-10-15", "2026-11-15", "2026-12-15"]);
});

test("MONTHLY con BYMONTHDAY=31 se salta los meses que no tienen día 31", () => {
  const ics = evento("DTSTART:20260831T100000Z", "RRULE:FREQ=MONTHLY;BYMONTHDAY=31");
  assert.deepEqual(dias(ics, new Date(2026, 9, 1), new Date(2027, 0, 1)), ["2026-10-31", "2026-12-31"]);
});

test("una serie semanal a las 10:00 de Madrid mantiene la hora local al cambiar el horario", () => {
  const ics = evento("DTSTART;TZID=Europe/Madrid:20261019T100000", "RRULE:FREQ=WEEKLY;COUNT=3");
  const horas = ocurrencias(parsearICS(ics), new Date(2026, 9, 19), new Date(2026, 10, 10)).map((o) => o.inicio.toISOString());
  assert.deepEqual(horas, ["2026-10-19T08:00:00.000Z", "2026-10-26T09:00:00.000Z", "2026-11-02T09:00:00.000Z"]);
});

test("EXDATE;VALUE=DATE excluye el día en una serie con hora", () => {
  const ics = evento("DTSTART;TZID=Europe/Madrid:20261116T100000", "RRULE:FREQ=DAILY;COUNT=5", "EXDATE;VALUE=DATE:20261118");
  assert.deepEqual(dias(ics, new Date(2026, 10, 16), new Date(2026, 10, 22)), ["2026-11-16", "2026-11-17", "2026-11-19", "2026-11-20"]);
});

test("una serie DAILY de hace más de 5000 días sigue apareciendo", () => {
  const ics = evento("DTSTART:20100101T090000Z", "RRULE:FREQ=DAILY");
  assert.deepEqual(dias(ics, new Date(2026, 10, 18), new Date(2026, 10, 21)), ["2026-11-18", "2026-11-19", "2026-11-20"]);
});

test("DAILY con INTERVAL desde hace años cae en los días que tocan", () => {
  const ics = evento("DTSTART:20100101T090000Z", "RRULE:FREQ=DAILY;INTERVAL=3");
  const esperado = [];
  for (let d = new Date(Date.UTC(2010, 0, 1)); d < new Date(Date.UTC(2026, 10, 25)); d = new Date(d.getTime() + 3 * 86400000)) {
    if (d >= new Date(Date.UTC(2026, 10, 18))) esperado.push(d.toISOString().slice(0, 10));
  }
  assert.deepEqual(dias(ics, new Date(2026, 10, 18), new Date(2026, 10, 25)), esperado);
});
