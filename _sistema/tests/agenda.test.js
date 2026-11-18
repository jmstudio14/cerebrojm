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
