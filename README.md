<div align="center">
  <img alt="Nozomi-Base thumbnail" src="./thumb.jpeg" width="100%">

  <h1>Nozomi-Base (ESM)</h1>
  <p><strong>Nozomi-Base</strong> is a ready-to-use and extensible WhatsApp bot base, allowing developers to focus on building features instead of dealing with connection handling, authentication, and other boilerplate setup.</p>
</div>

---

## About the Project Name

The name **Nozomi-Base** is inspired by **Tachibana Nozomi** from the game _Blue Archive_. This project uses the character's name solely as a source of inspiration for its identity and branding.

**Nozomi-Base** is an independent, fan-made open-source project and is **not affiliated with, endorsed by, or sponsored by** Nexon Games, Yostar, or any other official parties associated with _Blue Archive_.

All rights to **Blue Archive**, including its characters, names, artwork, music, and other intellectual property, remain the property of their respective copyright owners. This repository does not claim ownership of any _Blue Archive_ intellectual property.

If you are the rightful copyright holder and believe that any content in this repository infringes upon your rights, please contact the maintainer so the issue can be reviewed and resolved appropriately.

<br>
## Preview

<div align="center">
  <img alt="Nozomi-Base preview" src="https://cdn.ornzora.eu.cc/f73a503e-4a1f-4010-8b61-40006a01e5a1-upload-1786112811519.jpg" width="100%">
</div>

---

<details>
  <summary><strong>Key Features</strong></summary>

- **Automatic Plugin System (Hot Reload):** Add, edit, or remove `.plugin.js` files without restarting the bot. Changes are detected automatically within approximately 100ms.
- **Powerful Interactive Messages:** Powered by MessageBuilderV4.6, making it easy to send buttons, carousels, tables, syntax-highlighted code blocks, and many other interactive components.
- **Lightweight & Database-Free:** No `.env`, MySQL, or MongoDB required. Everything runs using memory or the local filesystem, making it ideal for low-cost VPS hosting or local development.
- **Flexible & Reliable Login:** Supports authentication via Pairing Code (phone number) or QR Code, with an intelligent auto-reconnect system.
- **Smart Developer Experience:** Includes Fuzzy Matching to automatically detect and correct mistyped commands.
- **Cross-Platform:** Works on Termux, Windows, Linux, Pterodactyl panels, and more.
</details>

<details>
  <summary><strong>Quick Start</strong></summary>

**Windows / Linux / VPS**

```bash
git clone https://github.com/dev-ryusei-hoshino/Nozomi-Base
cd Nozomi-Base
npm install
npm install sharp
npm start
```

**Android / Termux**

```bash
git clone https://github.com/dev-ryusei-hoshino/Nozomi-Base
cd Nozomi-Base
npm install
npm install sharp @img/sharp-wasm32
npm start
```

> **Connection:** Enter your WhatsApp phone number in the terminal (format: `628...`), then enter the generated pairing code from **Linked Devices** in your WhatsApp application.

</details>

<details>
  <summary><strong>Plugin Example</strong></summary>

```javascript
export default {
  name: <plugin_name>,
  command: [<command1>, <command2>],
  category: <category>,
  description: <description>,
  owner_only: boolean,  /* true | false */
  private_only: boolean, /* true | false */
  group_only: boolean, /* true | false */

  async run(conn, m, {
    jid,
    senderJid,
    senderLid,
    senderName,
    formattedLid,
    senderNumber,
    args,
    usedPrefix,
    isOwner,
    isAdmin,
    isBotAdmin,
    isGroup,
    isPrivate,
    isBroadcast,
    isChannel,
  }) {
    try {
      // Your code here
    } catch (e) {
      console.log(e);
      await m.react("❌");
    }
  },
};
```

> **Note:** Plugin filenames **must** end with `.plugin.js` (for example: `ping.plugin.js`) so they can be automatically detected by the plugin loader.

</details>

<details>
  <summary><strong>Auto Reload</strong></summary>

You can enable automatic file reloading by registering the file with `registerAutoReload()`.

```javascript
import { registerAutoReload } from "<PATH to filesWatcher.js>";

registerAutoReload(import.meta.url);
```

`import.meta.url` automatically identifies the current file, so you do not need to specify the file path manually.

**Example usage in a plugin:**

```javascript
import { registerAutoReload } from "../utils/filesWatcher.js";

registerAutoReload(import.meta.url);

export default {
  name: "ping",
  command: ["ping"],
  category: "main",
  description: "Simple ping command",
  owner_only: false,
  private_only: false,
  group_only: false,

  async run(conn, m) {
    return m.reply("pong");
  },
};
```

> **Note:** Any changes made to a registered file will be detected automatically and the module will be reloaded without restarting the bot.

</details>

<details>
  <summary><strong>Configuration Example</strong></summary>

```javascript
import packageFile from "./package.json" with { type: "json" };

export default {
  // false = Pairing Code, true = QR Code
  pairingWithQr: false,

  sessionDir: "nozomi_session", // session directory name

  syncFullHistory: false,
  checkForUpdates: true, // toggle update notification

  // Disable only if absolutely necessary
  ignore_self: true,

  markOnlineOnConnect: true,

  // Automatically mark incoming messages as read
  auto_read: true,

  bot: {
    name: "Nozomi Base",
    slog: "Pyahyaya~!",
    ver: packageFile.version,

    thumb:
      "https://i.ibb.co.com/0yJCNd0C/b1140d19-b147-4db9-8189-a0df99852a50.jpg",

    // Not really necessarry
    vid_thumb:
      "https://cdn.ornzora.eu.cc/7e92c9af-9e11-42f1-803c-8c23ecdb0ffe-upload-1786022115577.mp4",

    prefix: ["!", "."],

    owner: {
      number: "6285198221676",
      name: "Ryusei Hoshino",
    },
  },

  mess: {
    owner: "🚫 Access denied. This feature is restricted to the bot owner.",
    admin: "🚫 Access denied. Only group administrators can use this feature.",
    bot_not_admin: "⚠️ The bot must be an administrator to use this feature.",
    group: "⚠️ This feature can only be used in group chats.",
    private: "⚠️ This feature is only available in private chats.",
    premium:
      "🚫 Access denied. This feature is available to premium users only.",
    wait: "⏳ Processing your request...",
    plugin_not_available:
      "❌ Error: The requested plugin is currently unavailable.",
  },
};
```

</details>

<details>
  <summary><strong>Button Command Detection</strong></summary>

When an interactive button or list response is received, `handlers/button.js` extracts the selected button ID from `interactiveResponseMessage`, `templateButtonReplyMessage`, `buttonsResponseMessage`, or `listResponseMessage`. That ID is normalized into a command string: if it does not already start with the configured prefix, the first prefix (default `.`) is prepended. The result is parsed like a normal text command (prefix, command, args) and, if the command is registered in the plugin registry, the matching plugin runs with the same context as a typed command. Buttons can therefore trigger plugins directly without extra routing.

Each button or list row carries its own `id` set when the message is built. When clicked, WhatsApp returns that exact `id`, so different buttons can encode different commands and arguments. The ID is treated as a full command string, so arguments are space-separated just like a typed command. Unknown or unregistered commands are silently ignored, and permission checks (`owner_only`, `group_only`, `private_only`) still apply to each button execution.

**Example:** `.makeRow("⚡ Ping", "Test ping", "Tes latency bot", ".ping")` creates a row whose ID is `.ping`; clicking it runs the `ping` plugin.

### MessageBuilderV4.7.js Button Methods

Available methods for building interactive messages. Methods can be chained, and all return `this`.

| Method                                                                           | Description                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addButton(name, params)`                                                        | Adds a generic button to `this._buttons` with `name` and `buttonParamsJson`.                                                                                                        |
| `addSelection(title, options = {})`                                              | Creates a single-selection list message (`name: "single_select"`). Call `makeSection` / `makeRow` after this. Example: `addSelection("Menu", { description: "Choose an option" })`. |
| `makeSection(title = "", highlight_label = "")`                                  | Adds a section `{ title, highlight_label, rows: [] }` to the current selection. Must come after `addSelection`.                                                                     |
| `makeRow(header = "", title = "", description = "", id = "")`                    | Adds a row `{ header, title, description, id }` to the current section and selection. Example: `makeRow("⚡ Ping", "Test ping", "Tes latency bot", ".ping")`.                       |
| `addReply(display_text = "", id = "", options = {})`                             | Adds a quick-reply button (`name: "quick_reply"`).                                                                                                                                  |
| `addCall(display_text = "", id = "", options = {})`                              | Adds a call CTA button (`name: "cta_call"`).                                                                                                                                        |
| `addReminder(display_text = "", id = "", options = {})`                          | Adds a reminder CTA button (`name: "cta_reminder"`).                                                                                                                                |
| `addCancelReminder(display_text = "", id = "", options = {})`                    | Adds a cancel-reminder CTA button (`name: "cta_cancel_reminder"`).                                                                                                                  |
| `addAddress(display_text = "", id = "", options = {})`                           | Adds an address message button (`name: "address_message"`).                                                                                                                         |
| `addLocation(options = {})`                                                      | Adds a location-sharing button (`name: "send_location"`).                                                                                                                           |
| `addUrl(display_text = "", url = "", webview_interaction = false, options = {})` | Adds a URL CTA button (`name: "cta_url"`).                                                                                                                                          |
| `addCopy(display_text = "", copy_code = "", options = {})`                       | Adds a copy CTA button (`name: "cta_copy"`).                                                                                                                                        |
| `addButton(displayText = "", buttonId = crypto.randomUUID())`                    | Adds a classic V2 button `{ buttonId, buttonText: { displayText }, type: 1 }`, used by `build()` / `send()` for `buttonsMessage`.                                                   |
| `addRawButton(obj)`                                                              | Adds a plain button object directly. The value is validated and must not be `null` or an array.                                                                                     |
| `addTable(table, { hyperlink, citation, latex, id, replace, insertAt } = {})`    | Adds a rich table through `AIRich`.                                                                                                                                                 |
| `addSection(section, options = {})`                                              | Adds a section through `_addContent`.                                                                                                                                               |
| `addSubmessage(submessage, options = {})`                                        | Adds a validated submessage through `_addContent`.                                                                                                                                  |
| `clearButtons()`                                                                 | Clears `this._buttons`.                                                                                                                                                             |
| `setParams(obj)`                                                                 | Sets `this._params`.                                                                                                                                                                |

### Example

```javascript
new Button(conn)
  .setTitle("Menu")
  .setBody("Choose an option")
  .addSelection("Main Menu")
  .makeSection("Actions")
  .makeRow("⚡", "Ping", "Tes latency bot", ".ping")
  .makeRow("📋", "List", "Lihat daftar", ".list")
  .addButton("Direct", ".direct")
  .send(jid);
```

Clicking **Ping** sends the ID `.ping`, which `handleButton` resolves to the `ping` plugin. Clicking **Direct** sends the ID `.direct`, resolving to the `direct` plugin.

</details>

---

<div align="center">
  <a href="https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N"><strong>WhatsApp Channel</strong></a>
  &nbsp; · &nbsp;
  <a href="https://wa.me/6283892508772"><strong>Contact the Owner</strong></a>
</div>
