# ADR-0006 · Esquema único de metadatos

- **Estado:** **Aceptada** (2026-11-26), tal como se propone; sin implementar, pendiente en FEAT-012 (Fase 1 congelada).
- **Fecha:** 2026-11-18
- **Relacionado:** AUD-022, AUD-029, AUD-030

## Contexto

Los valores permitidos y los umbrales están repetidos en al menos seis sitios (AUD-030):
- `validar-vault.mjs`
- `Diagnóstico.md`
- las plantillas
- `README.md`
- `CLAUDE.md`
- `Guía rápida.md`

Ya existe una divergencia: estancado a 14 días frente a 7 (AUD-029). Además, los datos reales del usuario nunca se validan en local (AUD-022).

## Decisión propuesta

1. Un único archivo `_sistema/esquema.json` con:
   - campos por `tipo` (proyecto, herramienta) y si son obligatorios;
   - valores permitidos (`estado`, `categoria`, `prioridad`, `clase`, `uso`);
   - rangos (`progreso` de 0 a 100, `valoracion` de 1 a 5);
   - umbrales (días para "sin revisión" y "sin actividad").
2. Lo consumen:
   - `validar-vault.mjs` (Node);
   - `escanear.mjs`, que valida antes de escribir y se ejecuta al final del escaneo sobre los datos **locales** reales;
   - `Diagnóstico.md` e índices, que lo leen con `app.vault.adapter.read` en DataviewJS y amplían la validación a las herramientas.
3. La documentación (README, Guía, CLAUDE.md) **remite** al esquema en lugar de copiar los valores.
4. Las consultas DQL del Panel no pueden leer JSON. Sus umbrales quedan documentados como "espejo" del esquema y un test de CI comprueba que coinciden (`grep` de `dur(N days)` contra el esquema).

## Alternativas

- *JSON Schema formal con validador (ajv)*: añade una dependencia npm. Se descarta mientras el validador propio sea suficiente.
- *Dejar los valores duplicados*: mantiene las divergencias.

## Consecuencias

- Un test de coherencia impide que la documentación y el Panel diverjan del esquema.
- Requisito previo de cualquier interfaz nueva (ADR-0003).
