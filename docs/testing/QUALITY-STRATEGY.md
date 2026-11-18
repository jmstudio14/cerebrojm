# Estrategia de calidad y pruebas

## 1. Punto de partida (medido el 2026-11-18)

| Suite | Pruebas | Resultado | Cobertura de líneas |
|---|---|---|---|
| `agenda.test.js` | 8 | PASS | `agenda.js` 66,5 % |
| `escanear.test.mjs` | 5 | PASS | `escanear.mjs` 95,5 % (ramas 74 %) |
| `validar-vault.mjs` | — | PASS (repo sin datos) | — |

**Lección:** el escáner tiene un 95 % de cobertura y aun así tiene tres defectos reproducibles (AUD-001, 002, 020). **La cobertura no se usará como objetivo.** El objetivo es que **cada requisito y cada defecto tengan un test que fallaría si se rompe**.

## 2. Ciclo TDD obligatorio

1. **RED:** escribir el test que reproduce el defecto o el criterio de aceptación. Ejecutarlo y **pegar la salida en rojo en el PR**.
2. **GREEN:** el cambio mínimo que lo hace pasar.
3. **REFACTOR:** limpiar con todas las pruebas en verde. Sin cambios de comportamiento.

**Un PR que corrige un defecto sin su test RED previo no se acepta.**

## 3. Tipos de prueba

| Tipo | Qué cubre | Herramienta | ¿Automatizable en CI? |
|---|---|---|---|
| Unitarias | `partir`/`serializar` del frontmatter, detectores (git, stack, tests, herramientas), parser y expansión iCal, función de estrellas, agrupación de la agenda, cálculo de fechas | `node:test` | Sí |
| Integración | Escáner sobre carpetas temporales con repos git reales; copia y restauración de ida y vuelta; `gh` simulado | `node:test` y procesos hijo | Sí |
| Regresión | Un fixture por cada AUD-xxx corregido | `node:test` | Sí |
| Coherencia | Esquema frente a umbrales del Panel; esquema frente a documentación; `git check-ignore` de la zona personal | Script de Node | Sí |
| Compatibilidad | Rutas Windows, mayúsculas, `.bat`, CRLF, BOM | CI `windows-latest` más una lista manual | Parcial |
| Recuperación | Restaurar copia en un vault vacío; restaurar sobre uno existente sin pisar archivos recientes; escaneo interrumpido (se mata el proceso a mitad) sin archivos corruptos ni `.tmp` huérfanos que afecten | Integración | Sí |
| Seguridad | Ningún secreto ni dato personal en el repo; `permissions` mínimos en la CI; acciones fijadas por SHA; verificación de todas las referencias remotas (AUD-005) | Script más revisión del workflow | Sí (salvo `refs/pull`, que es una comprobación manual con `git ls-remote`) |
| Rendimiento | Escaneo de 200 proyectos sintéticos; expansión iCal de 500 eventos recurrentes | `node:test` con umbral generoso: solo vigila regresiones | Sí (informativo) |
| Aceptación | Escenarios de usuario (abajo) | Manual | **No** |

## 4. Matriz defecto → prueba

| Elemento | Prueba RED mínima |
|---|---|
| AUD-001 | Fixtures con BOM, CRLF, línea en blanco inicial y sin frontmatter → un solo frontmatter y campos manuales intactos; sin frontmatter → archivo intacto y "omitida" |
| AUD-002 | Dos proyectos con `a/skills` y `b/skills` → dos fichas distintas, en ambos órdenes |
| AUD-004 | `git check-ignore` de `02 Notas/x.md`, `03 Diario/x.md`, `04 Revisiones/x.md` y `_sistema/adjuntos/x.png` → ignorados; índices → no ignorados |
| AUD-005 | Script que recorre `git ls-remote` y falla si algún árbol contiene notas personales |
| AUD-010 | ICS con un evento roto y otro válido → aparece el válido y se avisa de 1 ignorado |
| AUD-011 | Semanal `America/New_York` con `TZ=Europe/Madrid` y `TZ=UTC` → horas correctas entre los dos cambios de hora |
| AUD-012 a 018 | Los casos C2, C8, C5, C6, C7, C4 y YEARLY de TECHNICAL-AUDIT §4 |
| AUD-020 / FEAT-001 | Repo con commit antiguo y cambio sin commit → `ultima_actividad` = hoy; carpeta sin Git con archivo anidado reciente |
| AUD-022 | Estrellas con 7, -1, "abc" o vacío → no lanza excepción |
| AUD-023 | (Windows) `App` y `app` → dos notas |
| AUD-024 | `TZ=Europe/Madrid`, reloj simulado a las 00:30 → fecha local |
| AUD-025 | Carpeta sin permisos → aviso y el escaneo continúa |
| AUD-026 | Modificación concurrente simulada → no se pierde |
| AUD-031 | Dos escaneos con `--hoy` distinto y sin cambios → 0 escrituras |
| FEAT-002 | Ida y vuelta con comparación de hashes; contraseña incorrecta; destino sin permisos |
| FEAT-012 | Valor fuera del esquema → el validador falla; un umbral del Panel distinto del esquema → falla el test de coherencia |

## 5. Pruebas que requieren Obsidian o Windows (NO automatizables hoy)

Lista de comprobación manual, que se firma en el PR correspondiente:

**Obsidian (escritorio)**
- [ ] `Diagnóstico.md`: todo en ✅, incluida la disponibilidad de `requestUrl`.
- [ ] El Panel renderiza sus 7 bloques sin error, con 0 proyectos y con 15 proyectos.
- [ ] La agenda muestra los eventos de un calendario real y coincide con Google Calendar durante una semana.
- [ ] Sin red: la agenda muestra la copia en caché con el aviso.
- [ ] El índice de herramientas renderiza con valores límite.
- [ ] Bases (FEAT-008): las vistas renderizan.

**Windows**
- [ ] `escanear.bat` con doble clic: la primera ejecución pregunta las carpetas y las guarda.
- [ ] Rutas con espacios, acentos y unidades distintas (C:, D:).
- [ ] Node no instalado o con versión menor de 18 → mensaje claro (AUD-032).
- [ ] `respaldar.bat` y `restaurar.bat` (FEAT-002).

**Agente (FEAT-004), en un repo de prueba**
- [ ] `/fase` cita el `CLAUDE.md` y el `ROADMAP.md` del repo de destino.
- [ ] `/implementar` sin plan aprobado → se niega.
- [ ] Termina en un PR en borrador con la evidencia de los tests; no hace ningún merge.
- [ ] Deja una línea en `## Registro`.

## 6. Quality gates

| Puerta | Condición | Dónde |
|---|---|---|
| G1 · PR | CI en verde (Ubuntu y Windows); test RED adjunto si es una corrección; sin datos personales (script) | GitHub Actions |
| G2 · Fin de fase | Todos los elementos de la fase con sus criterios de aceptación cumplidos; lista manual firmada si aplica | PR de cierre de fase |
| G3 · Adopción (antes de la Fase 1) | Ningún P0 abierto; simulacro de restauración hecho | Fase A |
| G4 · Agente | FEAT-004 solo se activa con G3 cumplida y la Fase 1 cerrada | — |

## 7. Cambios propuestos en la CI (no aplicados)

```yaml
permissions:
  contents: read
jobs:
  validar:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@<SHA fijado>
      - uses: actions/setup-node@<SHA fijado>
        with: { node-version: 22 }
      - run: node --test _sistema/tests/
      - run: node _sistema/tests/validar-vault.mjs
      - run: node _sistema/tests/coherencia.mjs     # esquema ↔ Panel ↔ .gitignore (nuevo)
```

*La ejecución de `node --test` sobre una carpeta debe verificarse en Node 22: en esta auditoría, `node --test _sistema/tests/` falló con "Cannot find module". Por eso la CI actual pasa archivos concretos.*
