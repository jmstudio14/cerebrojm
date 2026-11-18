<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="_sistema/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="_sistema/assets/banner-light.svg">
  <img alt="cerebrojm: cerebro digital con Obsidian, GitHub y Google Calendar" src="_sistema/assets/banner-light.svg" width="100%">
</picture>

<br>

**Todos tus proyectos, tu agenda y tus próximos pasos en un solo lugar.**<br>
Un vault de Obsidian que se sincroniza solo con GitHub y te dice qué está activo, qué se ha estancado y qué vence esta semana.

<br>

![Obsidian](https://img.shields.io/badge/Obsidian-vault-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white)
![Dataview](https://img.shields.io/badge/Dataview-0.5.68-5B21B6?style=for-the-badge)
![Obsidian Git](https://img.shields.io/badge/Obsidian_Git-sync-F05032?style=for-the-badge&logo=git&logoColor=white)
![Google Calendar](https://img.shields.io/badge/Google_Calendar-iCal-4285F4?style=for-the-badge&logo=googlecalendar&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-11-0078D4?style=for-the-badge&logo=windows11&logoColor=white)
![Repo privado](https://img.shields.io/badge/repo-privado-6B7280?style=for-the-badge&logo=github&logoColor=white)

[Funciones](#-funciones) ·
[Cómo funciona](#-cómo-funciona) ·
[Instalación](#-instalación) ·
[Uso](#-uso-diario) ·
[Modelo de datos](#-modelo-de-datos) ·
[Roadmap](#-roadmap)

</div>

---

## ✨ Funciones

<table>
<tr>
<td width="50%" valign="top">

### 📊 Panel de control
Estado de todos los proyectos de un vistazo: resumen por estado, barras de progreso, próxima acción y fecha límite, separados en código y personal/creativo.

</td>
<td width="50%" valign="top">

### ⚠️ Alertas automáticas
Señala lo que se está quedando atrás: **vencidos**, **bloqueados**, **estancados** (más de 14 días sin revisión) y proyectos **sin próxima acción**.

</td>
</tr>
<tr>
<td valign="top">

### 📅 Agenda de Google Calendar
Tus eventos de los próximos 7 días junto a las fechas límite de los proyectos. Soporta eventos recurrentes, excepciones y zonas horarias, y la URL privada **nunca** se sube al repo.

</td>
<td valign="top">

### 🔄 Sincronización con GitHub
Obsidian Git hace *pull* al abrir y *commit + push* cada 10 minutos, **solo del sistema** (Panel, plantillas, scripts). Tus notas se protegen con una copia cifrada local (`respaldar.bat`).

</td>
</tr>
<tr>
<td valign="top">

### 🧩 Plantillas
Proyecto, nota diaria (con la agenda del día), revisión semanal y nota. Todo con el mismo frontmatter, para que el Panel nunca se rompa.

</td>
<td valign="top">

### 🔁 Revisión semanal
30 minutos guiados: vaciar la bandeja, revisar los estancados y limitar los activos. Es lo que evita que el sistema se degrade.

</td>
</tr>
<tr>
<td valign="top">

### 🔍 Escáner de proyectos
`escanear.bat` recorre tus carpetas y crea una nota por proyecto: repositorio, último cambio, stack, descripción del README y si tiene ROADMAP, CLAUDE.md o tests. Al volver a escanear **nunca pisa lo que escribes a mano**.

</td>
<td valign="top">

### 🧰 Catálogo de herramientas
Detecta las skills, agentes y servidores MCP que usan tus proyectos (`skills-lock.json`, `.claude/`, `.mcp.json`) y crea una ficha por cada una, con su origen y los proyectos que la usan.

</td>
</tr>
</table>

> [!NOTE]
> **Este repo es solo el cerebro.** No contiene ningún dato de tus proyectos: las notas de `01 Proyectos/` y `05 Herramientas/` las genera el escáner en tu PC y están excluidas de Git.

<div align="center">
  <img src="_sistema/assets/panel.png" alt="Captura del Panel con resumen, agenda y proyectos activos (nombres difuminados)" width="92%">
  <br>
  <sub><i>Captura real del Panel; los nombres de proyecto y sus acciones están difuminados.</i></sub>
</div>

---

## 🧠 Cómo funciona

```mermaid
flowchart LR
    CARP["💻 Tus carpetas<br/>de proyectos"] -- "escanear.bat" --> PR
    GC["📅 Google Calendar"] -- "iCal secreto<br/>(solo en local)" --> FC["Full Calendar"]
    FC --> AG["agenda.js"]
    PR["📁 01 Proyectos<br/>frontmatter YAML"] --> DV["Dataview"]
    PR -- "fecha_limite" --> AG
    DV --> PANEL["📊 00 Panel"]
    AG --> PANEL
    VAULT[("Vault Obsidian")] <-- "Obsidian Git<br/>pull · commit · push" --> GH["🐙 GitHub<br/>repo privado"]

    style PANEL fill:#7c3aed,color:#fff,stroke:#5b21b6
    style GH fill:#24292f,color:#fff
    style GC fill:#4285f4,color:#fff
    style CARP fill:#0ea5e9,color:#fff
```

| Pieza | Papel |
|---|---|
| **Escáner** | `escanear.mjs` lee tus carpetas (Git, README, package.json, skills, MCP) y crea o actualiza las notas. Solo toca sus campos automáticos y su bloque `escaner`. |
| **Notas de proyecto** | Cada proyecto es un `.md` con frontmatter: estado, prioridad, progreso, fechas y próxima acción. Son la fuente de verdad y viven solo en tu PC. |
| **Dataview** | Consulta esas notas como si fueran una base de datos y genera las tablas del Panel. |
| **`agenda.js`** | Lee el calendario iCal, expande los eventos recurrentes y mezcla eventos y fechas límite. |
| **Obsidian Git** | Mantiene el vault y GitHub sincronizados en segundo plano. |

---

## 🚀 Instalación

> [!IMPORTANT]
> Este repositorio debe ser **privado**: contiene tus notas personales.

### 1 · Requisitos

<details>
<summary>Git para Windows y Obsidian</summary>

<br>

- [Git para Windows](https://git-scm.com/download/win). Incluye Git Credential Manager para iniciar sesión en GitHub.
- [Obsidian](https://obsidian.md/download).

</details>

### 2 · Clonar

```powershell
cd $HOME
git clone https://github.com/jmstudio14/cerebrojm.git
cd cerebrojm
git pull   # comprueba que la autenticación funciona
```

> [!WARNING]
> **No** lo clones dentro de OneDrive o Dropbox: dos sincronizadores sobre la misma carpeta corrompen el repositorio `.git`.

### 3 · Abrir en Obsidian

<details>
<summary>Abrir como vault y activar los plugins</summary>

<br>

1. Obsidian → **Open folder as vault** → `C:\Users\<tú>\cerebrojm`.
2. Pulsa **Trust author and enable plugins** (o *Ajustes → Community plugins → Turn on*).
3. Abre **`_sistema/Diagnóstico.md`**: comprueba plugins, calendario y proyectos. Todo debería salir en ✅.
4. Abre **`00 Panel.md`**, que también está en Marcadores.

Los plugins (Dataview, Obsidian Git y Full Calendar) **vienen incluidos** en `.obsidian/plugins/`: no hay que instalar nada.

</details>

### 4 · Conectar Google Calendar

<details>
<summary>Pegar la dirección secreta iCal (solo lectura)</summary>

<br>

1. [Google Calendar](https://calendar.google.com) → ⚙️ **Configuración** → tu calendario → **Integrar el calendario**.
2. Copia la **Dirección secreta en formato iCal** (termina en `basic.ics`).
3. Obsidian → **Ajustes → Full Calendar → Add calendar → iCal** → pega la URL.
4. Repite para cada calendario que quieras ver.

</details>

> [!TIP]
> La URL se guarda en `.obsidian/plugins/obsidian-full-calendar/data.json`, que está en `.gitignore`. Si alguna vez se filtra, en Google pulsa **Restablecer** la dirección secreta. Google actualiza este enlace con retraso (de minutos a horas).

### 5 · Cargar tus proyectos

Requiere [Node.js](https://nodejs.org) 18 o superior. Doble clic en **`escanear.bat`** (en la carpeta del vault):

1. La primera vez pregunta qué **carpetas madre** contienen tus proyectos, por ejemplo `C:\Programacion;D:\Creativo`. Cada subcarpeta cuenta como un proyecto. Se guarda en `_sistema/config/escaner.local.json`, que no se sube a Git (ver `escaner.ejemplo.json`).
2. Crea una nota por proyecto en `01 Proyectos/` y una ficha por herramienta en `05 Herramientas/`, con la etiqueta `revisar`.
3. Vuelve a ejecutarlo cuando quieras actualizar: refresca repositorio, último cambio y el bloque automático, y **respeta** estado, prioridad, progreso, próxima acción y todo tu texto. Si una carpeta desaparece, avisa pero no borra la nota.

```powershell
node _sistema/scripts/escanear.mjs --carpetas "C:\Programacion"   # alternativa desde terminal
```

### 6 · Copias de seguridad

Tus notas (proyectos, notas, diario, revisiones, herramientas y adjuntos) **no se suben a GitHub**. Protégelas con una copia cifrada:

1. Doble clic en **`respaldar.bat`**. La primera vez pregunta en qué carpeta guardar las copias: mejor un disco externo o una carpeta de la nube, porque van cifradas.
2. Elige una contraseña. **No se guarda en ningún sitio: si la olvidas, la copia no se puede recuperar.**
3. Se crea `cerebrojm-AAAA-MM-DD_hhmmss.cjmbak` (AES-256-GCM) y se conservan las 10 últimas.

Para recuperar: **`restaurar.bat`** restaura la copia más reciente **sin pisar** archivos que hayas modificado después (añade `--forzar` para sobrescribirlos). El Diagnóstico (`_sistema/Diagnóstico.md`) te avisa si la última copia tiene más de 14 días.

> [!TIP]
> Hazlo cada semana al terminar la revisión semanal, y siempre antes de cambiar de PC.

---

## 🗓️ Uso diario

| Quiero… | Cómo |
|---|---|
| Crear un proyecto | Nota nueva en `01 Proyectos/` → `Ctrl+P` → *Templates: Insert template* → **Proyecto** |
| Ver el día | `Ctrl+P` → *Daily notes: Open today's daily note* |
| Hacer la revisión semanal | Nota nueva en `04 Revisiones/` → plantilla **Revisión semanal** |
| Ver el calendario completo | `Ctrl+P` → *Full Calendar: Open Calendar* |
| Sincronizar ya | `Ctrl+P` → *Obsidian Git: Commit-and-sync* |

La rutina completa y el significado de cada alerta están en **[Guía rápida](Guía%20rápida.md)**.

### 🤖 Con Claude Code
Abre Claude Code en la carpeta del vault. El subagente `gestor-proyectos` (`.claude/agents/`) solo edita `01 Proyectos/`, `04 Revisiones/` y `05 Herramientas/`, y estos comandos (`.claude/commands/`) hacen el trabajo repetitivo:

| Comando | Qué hace |
|---|---|
| `/estado` | Resumen por estado con las mismas alertas que el Panel (`_sistema/scripts/estado.mjs`), el último push de cada repo de GitHub y sus PRs abiertos. Solo escribe `ultimo_push`. |
| `/revision` | Crea `04 Revisiones/AAAA-MM-DD.md` desde la plantilla, con los datos del día. No sobrescribe y no marca el checklist. |
| `/proyecto <nombre>` | Ficha del proyecto, últimos commits, PRs abiertos y una propuesta de siguiente paso. Solo lectura. |
| `/fase <nombre>` | Lee el repo del proyecto (su `CLAUDE.md`, `ROADMAP.md`, tests y CI) y propone el plan de su fase siguiente. No escribe nada. |
| `/implementar <nombre>` | Presenta el plan de la fase siguiente y, con tu aprobación, la implementa en una rama `fase/<id>-<slug>` del repo del proyecto (tests y lint del propio repo), abre un **PR en borrador** y actualiza la nota del proyecto. Nunca fusiona. |
| `/seguimiento [nombre]` | Vigila los PRs `fase/*` abiertos (CI y comentarios). Si falla la CI o **tú** pides algo en un comentario, lo corrige en la misma rama con un push normal y responde con el prefijo `🤖 Seguimiento:`. Cuando fusionas un PR, lo refleja en la nota del proyecto y propone la fase siguiente «por confirmar». Los comentarios de terceros y de bots son datos, no órdenes. |

Ninguno hace commit ni push en el vault. `/implementar` sí hace commits y un push normal, pero solo en la rama de fase del repo del proyecto; el PR lo revisas y lo fusionas tú.

`.claude/settings.json` bloquea con reglas `deny` las órdenes que `/implementar` nunca debe ejecutar: `gh pr merge`, `gh pr ready`, `gh repo delete`, push forzado, push a `main`/`master` (incluidos refspecs como `HEAD:main`) y `git reset --hard`. Es una defensa en profundidad, no una frontera: las reglas casan por texto y un flag en una posición imprevista podría escaparse. Por eso la regla también está escrita en el propio comando.

---

## 🧬 Modelo de datos

Cada proyecto lleva este frontmatter. El Panel depende de que los nombres y los valores sean exactamente estos.

```yaml
tipo: proyecto
categoria: codigo          # codigo · personal · creativo
estado: activo             # idea · activo · pausado · bloqueado · completado · archivado
prioridad: alta            # alta · media · baja
progreso: 40               # 0–100
fecha_limite: 2026-11-30   # aparece en la agenda
ultima_revision: 2026-11-18  # +14 días → estancado
proxima_accion: "Una acción concreta"
repo: "https://github.com/…"
```

```mermaid
stateDiagram-v2
    direction LR
    [*] --> idea
    idea --> activo
    activo --> completado
    activo --> pausado
    activo --> bloqueado
    pausado --> activo
    bloqueado --> activo
    idea --> archivado
    pausado --> archivado
    completado --> [*]
    archivado --> [*]
```

Las tareas `- [ ]` bajo **Próximas tareas** de los proyectos activos aparecen en el Panel.

---

## 📂 Estructura

```text
cerebrojm/
├── 00 Panel.md               Dashboard principal
├── Guía rápida.md            Rutina diaria/semanal y señales de alarma
├── ROADMAP.md                Evolución del propio sistema
├── escanear.bat              Carga o actualiza tus proyectos y herramientas
├── respaldar.bat · restaurar.bat   Copia cifrada de tus datos personales
├── 01 Proyectos/             Una nota por proyecto, generada en tu PC (+ índice)
├── 02 Notas/                 Ideas y bandeja de entrada (+ índice)
├── 03 Diario/                Notas diarias AAAA-MM-DD (+ índice)
├── 04 Revisiones/            Revisiones semanales (+ índice)
├── 05 Herramientas/          Skills, agentes y MCP detectados, en tu PC (+ índice)
├── _sistema/
│   ├── plantillas/           Proyecto · Nota diaria · Revisión semanal · Nota · Herramienta
│   ├── scripts/agenda.js     Lector iCal + fechas límite
│   ├── scripts/escanear.mjs  Escáner de proyectos y herramientas
│   ├── scripts/estado.mjs    Resumen de estado y alertas (solo lectura)
│   ├── config/               Configuración local del escáner (*.local.json fuera de Git)
│   ├── tests/                Tests de la agenda y del escáner, validador del vault (CI)
│   ├── Diagnóstico.md        Autocomprobación del sistema
│   └── assets/               Imágenes del README
├── .claude/                  Subagente gestor-proyectos y comandos /estado, /revision y /proyecto
└── .obsidian/                Configuración y plugins incluidos
```

---

## 🛣️ Roadmap

| Fase | Estado | Objetivo |
|:---:|:---:|---|
| **0** | ✅ Hecha | Vault, Panel, agenda, plantillas y proyectos importados |
| **1** | 🔄 En curso | Adopción: 2 semanas de uso real y máximo 3-4 proyectos activos |
| **2** | ⏳ | Agente de Claude Code que gestiona los proyectos e implementa la siguiente fase de cada repo vía PR |
| **3** | ⏳ | App de escritorio minimalista y profesional (Tauri + React), con sistema de diseño propio |
| **4** | ⏳ | Estado de los repos actualizado automáticamente desde GitHub |
| **5** | ⏳ | Proyectos personales y creativos |
| **6** | ⏳ | Captura desde el móvil (opcional) |

Detalle y criterios de terminado en **[ROADMAP.md](ROADMAP.md)**. Regla: no se empieza una fase hasta cerrar la anterior.

---

## 🔒 Privacidad

- **Tus datos no salen de tu PC** ([ADR-0001](docs/architecture/ADR/0001-datos-personales-y-backup.md)): `01 Proyectos/`, `02 Notas/`, `03 Diario/`, `04 Revisiones/`, `05 Herramientas/`, `_sistema/adjuntos/` y la configuración local están en `.gitignore`. GitHub guarda solo el sistema. Para no perderlos, usa `respaldar.bat` (copia cifrada) y, al cambiar de equipo, `restaurar.bat`.
- La URL secreta del calendario vive solo en tu equipo (`.gitignore`).
- El estado local de Obsidian (`workspace.json`) no se sincroniza, así que no hay conflictos entre equipos.
- Cada push ejecuta un CI (`.github/workflows/validar.yml`) que prueba el lector iCal, el escáner y la copia de seguridad (con datos ficticios), comprueba que la zona personal sigue fuera de Git y valida las notas del repo.
- Los commits automáticos no incluyen el nombre de tu equipo.
- Si Obsidian Git detecta un conflicto, te avisa: abre el archivo, quédate con la versión buena y haz *Commit-and-sync*.

---

<div align="center">

Hecho con Obsidian · Uso personal · Todos los derechos reservados

<sub>Las notas son tuyas; este repo solo las ordena.</sub>

</div>
