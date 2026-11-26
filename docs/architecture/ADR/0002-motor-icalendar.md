# ADR-0002 · Motor iCalendar: parser propio frente a biblioteca mantenida

- **Estado:** **Aceptada** (2026-11-26), tal como se propone: primero el spike y el motor se elige según su resultado; pendiente en FEAT-014 (Fase 1 congelada).
- **Fecha:** 2026-11-18
- **Relacionado:** AUD-010 a AUD-018, AUD-036

## Contexto

- `_sistema/scripts/agenda.js` tiene un parser y un expansor de recurrencias propios, de unas 200 líneas.
- Funciona en los casos básicos (8 tests en verde), pero esta auditoría reproduce **8 defectos por ejecución**: recurrencias con zona horaria distinta a la del equipo, `BYSETPOS`, `DAILY+BYDAY`, `DURATION`, `RDATE`, parámetros entre comillas, el tope de iteraciones y la caída completa ante un evento mal formado.
- RFC 5545 es amplio. Cubrirlo a mano exige mucho código y pruebas.

## Opciones (datos del registro npm, consultados el 2026-11-18)

| Opción | Versión / fecha | Licencia | Dependencias | Tamaño npm sin empaquetar | Alcance |
|---|---|---|---|---|---|
| **Parser propio corregido** | — | — | 0 | unos 14 KB | Lo que se programe |
| **ical.js** (Mozilla/Thunderbird) | 2.2.1 · 2025-08-08 | MPL-2.0 | 0 | 1,2 MB, incluye fuentes y builds | Parser completo, `VTIMEZONE`, expansión de recurrencias (`RRULE`, `RDATE`, `EXDATE`, excepciones), `DURATION` |
| rrule | 2.8.1 · 2023-11-10 | BSD-3-Clause | `tslib` | 687 KB | Solo RRULE; hace falta parser ICS aparte; sin publicaciones desde 2023 |
| node-ical | 0.27.6 · 2026-11-08 | Apache-2.0 | `rrule-temporal`, `temporal-polyfill` | 454 KB más dependencias | Orientado a Node; **compatibilidad con el entorno DataviewJS de Obsidian no verificada** |

**Hecho relevante:** el plugin Full Calendar ya incluido en el vault empaqueta `ical.js` en su `main.js`. Se ha comprobado con `grep`: aparecen `ical.js` y `ICAL.Time`. Es una pista de que funciona dentro de Obsidian, aunque no se puede reutilizar directamente desde DataviewJS.

> El mantenimiento real de cada biblioteca (issues abiertos, ritmo de releases) no se ha verificado más allá de la fecha de su última publicación en npm. Context7 no estaba disponible en el entorno de la auditoría.

## Decisión propuesta

1. **Spike acotado (BL FEAT-014):** cargar el build de navegador de `ical.js` 2.x copiado en `_sistema/vendor/` desde DataviewJS en Obsidian para escritorio, y medir:
   - que la carga funciona sin bundler;
   - que los 8 casos de AUD-010 a AUD-018 dan el resultado esperado (los tests RED de [QUALITY-STRATEGY](../../testing/QUALITY-STRATEGY.md));
   - el tiempo de render del Panel con un calendario real;
   - el tamaño del archivo incluido en el vault.
2. **Si el spike pasa:** sustituir `parsearICS` y `expandir` por `ical.js`, y mantener propios solo la caché, el render y las fechas límite.
3. **Si el spike falla** (no carga en DataviewJS o rinde mal): mantener el parser propio y corregir los defectos uno a uno con TDD, empezando por AUD-010 (aislar cada evento con `try/catch`) y AUD-011 (expandir en la zona `TZID`).

## Justificación

- Un motor probado durante años en un cliente de correo reduce el riesgo en la parte del RFC que el código propio nunca cubrirá: `VTIMEZONE` personalizados, `RANGE` y reglas combinadas.
- **MPL-2.0** es *copyleft* a nivel de archivo: el archivo incluido puede distribuirse sin modificar, junto con su licencia. Es compatible con un vault privado.
- **No se recomienda** `rrule`: no parsea ICS y no publica versiones desde 2023.
- **No se recomienda** `node-ical`: depende de Node y de polyfills cuya ejecución en el entorno de Obsidian no está verificada.

## Consecuencias

- Incluir el archivo añade decenas de KB al repo. El tamaño exacto del build minificado se medirá en el spike.
- AUD-010 (caída completa) debe arreglarse **antes** y de forma independiente, porque es barato y P1.
