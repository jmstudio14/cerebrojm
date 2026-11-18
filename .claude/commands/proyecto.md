---
description: Ficha de un proyecto, sus últimos cambios en el repo y una propuesta de siguiente paso
argument-hint: <nombre del proyecto>
allowed-tools: Bash(git -C:*), Bash(gh:*), Read, Glob, Grep
---

Proyecto: $ARGUMENTS

Solo lectura: no edites ninguna nota salvo que el usuario lo pida después. Sigue las reglas de `CLAUDE.md`.

1. Localiza `01 Proyectos/<nombre>.md` (busca sin distinguir mayúsculas; si hay varias coincidencias, enuméralas y pregunta). Si no existe, dilo y detente.
2. Resume su frontmatter y secciones: `categoria`, `estado`, `prioridad`, `progreso`, `ultima_revision`, `proxima_accion`, `fecha_limite`, `## Próximas tareas` abiertas y `## Registro` reciente.
3. Si `ruta_local` existe: `git -C "<ruta_local>" log -5 --format="%cs %s"`, `git -C "<ruta_local>" status --short` y la rama actual.
4. Si `repo` es una URL de GitHub: `gh pr list --repo <dueño>/<repo> --state open --json number,title,url`.
5. Si el repo tiene `ROADMAP.md`, indica la primera tarea abierta; es solo orientación.

Responde con: ficha breve, últimos cambios, PRs abiertos y **una** propuesta de siguiente paso razonada. Lo que no puedas comprobar (ruta que no existe, `gh` que falla), «por confirmar».
