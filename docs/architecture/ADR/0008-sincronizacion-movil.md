# ADR-0008 · Captura desde el móvil con Obsidian Sync

- **Estado:** Aceptada (2026-11-25). Decisión del usuario: Obsidian Sync, Android y solo captura.
- **Fecha:** 2026-11-25
- **Relacionado:** `ROADMAP.md` Fase 6, FEAT-007, ADR-0001

## Contexto

- La Fase 6 pide capturar una idea en el móvil y que aparezca en el PC sin pasos manuales.
- La bandeja de entrada está en `02 Notas/`, que no se versiona (ADR-0001). Obsidian Git en el móvil no la sincronizaría.

## Decisión

**Obsidian Sync**, limitado a lo necesario para capturar:

- Carpetas excluidas en **cada** dispositivo: `01 Proyectos`, `03 Diario`, `04 Revisiones`, `05 Herramientas`, `_sistema` y `docs`.
- Sincronización de la configuración del vault desactivada: al móvil no llegan plugins, ni la URL del calendario, ni Obsidian Git.
- Imágenes, audio, vídeo, PDF y otros tipos desactivados: solo viaja texto.
- En el móvil, `02 Notas` como carpeta por defecto para notas nuevas y adjuntos.
- Cifrado de extremo a extremo con contraseña propia.

Los pasos están en el `README.md` (paso 8).

## Alternativas

| Opción | Motivo de descarte |
|---|---|
| Syncthing | Gratis, pero los dos dispositivos tienen que coincidir encendidos |
| Carpeta en la nube y script de importación | Código y tarea programada nuevos; las ideas pasan sin cifrado propio por un tercero |
| Obsidian Git en el móvil | Obliga a subir la bandeja a GitHub, en contra del ADR-0001 |

## Consecuencias

- Coste recurrente de la suscripción.
- `02 Notas/` sale del PC, cifrada, hacia los servidores de Obsidian.
- Los `.md` de la raíz del vault no se pueden excluir por carpeta: se sincronizan, además de estar en Git.
- Las capturas llegan al PC cuando Obsidian está abierto allí.
- `.gitignore` excluye los `.md` nuevos de la raíz; solo se versionan los cinco del sistema. Un `.md` de sistema nuevo en la raíz hay que exceptuarlo.
- Riesgo que queda: otros archivos de la raíz y las carpetas nuevas creadas en el móvil no están en `.gitignore` y Obsidian Git los subiría. Hoy solo lo evita la forma de usar el móvil.
- Sync no es una copia de seguridad: `respaldar.bat` sigue siendo necesario.
- `.obsidian/sync.json` se excluye de Git de forma preventiva. **Por confirmar** qué archivos de estado crea Sync: se comprueba con `git status` al configurarlo.

## Referencias

Ayuda de Obsidian, consultada el 2026-11-25: [ajustes y sincronización selectiva](https://obsidian.md/help/sync/settings), [configuración](https://obsidian.md/help/sync/setup) y [planes](https://obsidian.md/help/sync/plans).
