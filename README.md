# 🧠 cerebrojm — Cerebro digital

Vault de Obsidian para gestionar proyectos (código y personales/creativos) con:

- **Panel** (`00 Panel.md`): estado de todos los proyectos, alertas (vencidos, bloqueados, estancados, sin próxima acción), tareas abiertas y agenda.
- **Google Calendar** en modo lectura: vista de calendario completa (plugin Full Calendar) + agenda de 7 días dentro del Panel y de cada nota diaria.
- **Sincronización con GitHub** automática (plugin Obsidian Git: pull al abrir y commit+push cada 10 min).

Los plugins ya vienen incluidos en `.obsidian/plugins/`: no hay que instalar nada desde Obsidian.

---

## Instalación en Windows (una sola vez)

### 1. Requisitos
- [Git para Windows](https://git-scm.com/download/win) (incluye Git Credential Manager para iniciar sesión en GitHub).
- [Obsidian](https://obsidian.md/download).

### 2. Clonar
Abre **PowerShell**:

```powershell
cd $HOME
git clone https://github.com/jmstudio14/cerebrojm.git
cd cerebrojm
git pull            # comprueba que la autenticación funciona
```

> ⚠️ **No** lo clones dentro de una carpeta de OneDrive/Dropbox: dos sincronizadores sobre la misma carpeta corrompen el repositorio `.git`.

### 3. Abrir en Obsidian
1. Obsidian → *Open folder as vault* → selecciona `C:\Users\<tú>\cerebrojm`.
2. Cuando pregunte, pulsa **Trust author and enable plugins** (o Ajustes → *Community plugins* → *Turn on community plugins*).
3. Abre `00 Panel.md` (también está en Marcadores).

### 4. Conectar Google Calendar (solo lectura)
1. En [Google Calendar](https://calendar.google.com) (web) → ⚙️ *Configuración* → en la izquierda, tu calendario → *Integrar el calendario*.
2. Copia la **Dirección secreta en formato iCal** (termina en `basic.ics`).
3. En Obsidian: Ajustes → **Full Calendar** → *Add calendar* → tipo **iCal** → pega la URL → *Add*.
4. Repite para cada calendario que quieras ver.

La URL se guarda en `.obsidian/plugins/obsidian-full-calendar/data.json`, que está en `.gitignore`: **nunca se sube a GitHub**. Quien tenga esa URL puede leer tu calendario; si se filtra, en Google puedes *Restablecer* la dirección secreta.

Nota: Google refresca la URL iCal con retraso (de minutos a varias horas). Para lo inmediato, consulta Google Calendar directamente.

---

## Uso diario

| Acción | Cómo |
|---|---|
| Nuevo proyecto | Crea una nota en `01 Proyectos/` → paleta de comandos (`Ctrl+P`) → *Templates: Insert template* → **Proyecto** |
| Nota diaria | `Ctrl+P` → *Daily notes: Open today's daily note* (incluye la agenda del día) |
| Revisión semanal | Nota nueva en `04 Revisiones/` → plantilla **Revisión semanal** |
| Ver calendario | `Ctrl+P` → *Full Calendar: Open Calendar* |
| Sincronizar ya | `Ctrl+P` → *Obsidian Git: Commit-and-sync* |

### Campos de un proyecto

| Campo | Valores |
|---|---|
| `categoria` | `codigo`, `personal`, `creativo` |
| `estado` | `idea`, `activo`, `pausado`, `bloqueado`, `completado`, `archivado` |
| `prioridad` | `alta`, `media`, `baja` |
| `progreso` | 0–100 |
| `fecha_limite` | `AAAA-MM-DD` (aparece en la agenda) |
| `ultima_revision` | `AAAA-MM-DD`. Si pasan más de 14 días, el proyecto sale como *estancado* |
| `proxima_accion` | Una acción concreta. Si está vacía, el proyecto sale en *Necesitan atención* |
| `repo`, `ruta_local` | Solo para proyectos de código |

Las tareas `- [ ]` bajo el encabezado **Próximas tareas** de proyectos activos aparecen en el Panel.

---

## Estructura

```
00 Panel.md              Dashboard principal
Guía rápida.md           Rutina diaria/semanal y señales de alarma
01 Proyectos/            Una nota por proyecto
02 Notas/                Notas sueltas e ideas (bandeja de entrada)
03 Diario/               Notas diarias (AAAA-MM-DD)
04 Revisiones/           Revisiones semanales
_sistema/plantillas/     Plantillas
_sistema/scripts/        agenda.js (lector iCal + fechas límite)
.obsidian/               Configuración y plugins (Dataview, Obsidian Git, Full Calendar)
```

Cada carpeta tiene una nota `_Índice …` con sus consultas.

## Sincronización: qué tener en cuenta
- Obsidian Git hace *pull* al abrir y *commit + push* cada 10 minutos. Si editas desde otro sitio (GitHub web, Claude Code), los cambios llegan en el siguiente pull.
- Si aparece un conflicto, Obsidian Git lo avisa; ábrelo, quédate con la versión buena y haz *Commit-and-sync*.
- El repo debe ser **privado**.
