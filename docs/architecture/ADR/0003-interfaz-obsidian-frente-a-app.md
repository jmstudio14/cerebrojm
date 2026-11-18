# ADR-0003 · Interfaz principal: Obsidian frente a una aplicación de escritorio propia

- **Estado:** Propuesta
- **Fecha:** 2026-11-18
- **Relacionado:** `ROADMAP.md` Fase 3 (app de escritorio), FEAT-008, FEAT-013

## Contexto

`ROADMAP.md` incluye una Fase 3 (aplicación Tauri + React) con una condición de entrada. El sistema todavía no se ha usado en real (Fase 1 sin empezar), así que no hay datos sobre las carencias de la interfaz.

## Comparación

| Criterio | Obsidian + Dataview/Bases | App Tauri + React |
|---|---|---|
| Coste inicial | Bajo: ya existe | Alto: sistema de diseño, 6 pantallas, escritura segura, instalador |
| Mantenimiento | Bajo-medio: consultas y plugins | Alto: Rust, Node, actualizaciones de Tauri, firma del instalador |
| Datos | Markdown en el vault, una sola fuente | Debe leer y escribir el mismo Markdown sin romperlo (riesgo tipo AUD-001, multiplicado) |
| Edición rica | Nativa (Markdown, enlaces, búsqueda) | Hay que reimplementarla |
| Vistas avanzadas | Bases (núcleo, ya activado): tabla, tarjetas, filtros. Kanban mediante plugin | Libre |
| Móvil | Obsidian móvil, sin el escáner | Requiere otra app |
| Riesgo de abandono | Bajo | Alto: un segundo sistema que mantener |

## Decisión propuesta

- **Obsidian sigue siendo la interfaz principal.**
- Antes de considerar la app, agotar las vistas nativas: **Bases** para tarjetas y tablas filtrables (FEAT-008).
- La Fase 3 se mantiene solo como **opción condicionada**. Se activa si, tras la Fase 1 y FEAT-008, quedan necesidades concretas que Obsidian no cubre (por ejemplo, edición masiva o arrastrar entre columnas sin plugins), escritas como casos de uso.

## Consecuencias

- Se evita construir un producto paralelo sin evidencia de uso.
- Si se activa la app, el [ADR-0006](0006-esquema-unico-de-metadatos.md) (esquema único) es un requisito previo.
