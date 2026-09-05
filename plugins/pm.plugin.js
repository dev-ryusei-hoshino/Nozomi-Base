import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { pluginTracker } from "../plugins/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeFilename(name) {
  if (!name.endsWith(".plugin.js")) {
    return `${name}.plugin.js`;
  }
  return name;
}

function getFileByCommand(command) {
  const lower = command.toLowerCase();
  for (const [file, cmds] of pluginTracker.entries()) {
    if (cmds.map((c) => c.toLowerCase()).includes(lower)) {
      return file;
    }
  }
  return null;
}

async function extractPdfText(buffer) {
  const uint8 = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  const loadingTask = getDocument(uint8);
  const doc = await loadingTask.promise;
  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join("") + "\n";
  }
  return fullText;
}

async function extractTextFromQuoted(m, conn) {
  const quoted =
    m?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted) return null;

  const textContent =
    quoted.conversation ||
    quoted.extendedTextMessage?.text ||
    quoted.imageMessage?.caption ||
    quoted.videoMessage?.caption;

  if (textContent) {
    return textContent.trim();
  }

  if (quoted.documentMessage) {
    const buffer = await downloadMediaMessage(
      { key: m.key, message: quoted },
      "buffer",
      {},
      { logger: undefined, reuploadRequest: conn.updateMediaMessage },
    );

    if (!buffer?.length) return null;

    const mime = quoted.documentMessage.mimetype || "";

    if (mime.includes("text") || mime === "application/javascript") {
      return buffer.toString("utf-8");
    } else if (mime === "application/pdf") {
      return await extractPdfText(buffer);
    } else {
      return null;
    }
  }

  return null;
}

async function validatePlugin(code) {
  const tempName = `__temp_${Date.now()}.js`;
  const tempPath = path.join(__dirname, tempName);

  fs.writeFileSync(tempPath, code, "utf-8");

  try {
    const fileUrl = pathToFileURL(tempPath).href;
    const module = await import(fileUrl);
    const plugin = module.default;

    if (!plugin) {
      return { valid: false, error: "No default export found." };
    }

    const missing = [];
    if (!plugin.name) missing.push("name");
    if (!plugin.command) missing.push("command");
    if (!plugin.category) missing.push("category");
    if (typeof plugin.run !== "function") missing.push("run");

    if (missing.length > 0) {
      return { valid: false, error: `Missing exports: ${missing.join(", ")}` };
    }

    const primaryCmd = Array.isArray(plugin.command)
      ? plugin.command[0]
      : plugin.command;
    const filename = normalizeFilename(primaryCmd);

    return { valid: true, plugin, filename, tempName, tempPath };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function installPlugin(conn, m, code, usedPrefix, command) {
  if (!code) {
    return await m.reply(
      `Send the plugin code or reply to a document containing the code with:\n> ${usedPrefix + command} install <code>`,
    );
  }

  const validation = await validatePlugin(code);

  if (!validation.valid) {
    return await m.reply(`❌ Invalid plugin:\n${validation.error}`);
  }

  const { filename, tempName, tempPath } = validation;
  const finalPath = path.join(__dirname, filename);

  if (fs.existsSync(finalPath)) {
    fs.unlinkSync(tempPath);
    return await m.reply(
      `⚠️ Plugin with the command \`${filename}\` already exists. Use \`${usedPrefix + command} remove ${filename}\` to delete it first.`,
    );
  }

  fs.renameSync(tempPath, finalPath);

  await m.reply(`✅ Plugin successfully installed as \`${filename}\``);

  if (fs.existsSync(`./plugin/${tempName}`)) {
    fs.rmdirSync(`./plugin/${tempName}`);
  }
}

async function getPlugin(conn, m, target, usedPrefix, command) {
  if (!target) {
    return await m.reply(
      `Use:\n> ${usedPrefix + command} get <plugin_name|command>`,
    );
  }

  let filename = target.endsWith(".plugin.js") ? target : null;

  if (!filename) {
    filename = getFileByCommand(target);
  }

  if (!filename) {
    return await m.reply(`❌ Plugin \`${target}\` not found.`);
  }

  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return await m.reply(`❌ File \`${filename}\` not found.`);
  }

  const buffer = fs.readFileSync(filePath);

  await conn.sendMessage(
    m.key.remoteJid,
    {
      document: buffer,
      fileName: filename,
      mimetype: "application/javascript",
    },
    { quoted: m },
  );
}

async function removePlugin(conn, m, target, usedPrefix, command) {
  if (!target) {
    return await m.reply(
      `Use:\n> ${usedPrefix + command} remove <plugin_name.plugin.js>`,
    );
  }

  const filename = normalizeFilename(target);
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return await m.reply(`❌ File \`${filename}\` not found.`);
  }

  fs.unlinkSync(filePath);

  await m.reply(`✅ Plugin \`${filename}\` successfully deleted.`);
}

async function listPlugins(conn, m) {
  const files = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith(".plugin.js") && f !== "index.js");

  if (files.length === 0) {
    return await m.reply("No plugins installed.");
  }

  let text = `📦 Plugin List (${files.length}):\n\n`;

  for (const file of files) {
    const loaded = pluginTracker.has(file);
    const status = loaded ? "✅ Valid" : "❌ Error";
    const cmds = loaded ? pluginTracker.get(file).join(", ") : "failed to load";
    text += `${status} \`${file}\` → ${cmds}\n`;
  }

  await m.reply(text);
}

async function renamePlugin(conn, m, oldName, newName, usedPrefix, command) {
  if (!oldName || !newName) {
    return await m.reply(
      `Use:\n> ${usedPrefix + command} rename <plugin_name> <new_name>\nOr:\n> ${usedPrefix + command} rename <plugin_name>.plugin.js <new_name>.plugin.js`,
    );
  }

  const oldFilename = normalizeFilename(oldName);
  const newFilename = normalizeFilename(newName);
  const oldPath = path.join(__dirname, oldFilename);
  const newPath = path.join(__dirname, newFilename);

  if (!fs.existsSync(oldPath)) {
    return await m.reply(`❌ Plugin \`${oldFilename}\` not found.`);
  }

  if (fs.existsSync(newPath)) {
    return await m.reply(`⚠️ Plugin \`${newFilename}\` already exists.`);
  }

  fs.renameSync(oldPath, newPath);

  await m.reply(
    `✅ Plugin successfully renamed:\n${oldFilename} → ${newFilename}`,
  );
}

export default {
  name: "Plugin Manager",
  command: ["pm", "plugin_manager", "plugins"],
  owner_only: true,
  private_only: false,
  group_only: false,
  description: "Manage bot plugins",
  category: "owner",

  async run(conn, m, { jid, args, usedPrefix, command }) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);

    switch (sub) {
      case "install":
        {
          let code = rest.join(" ");

          if (!code) {
            code = await extractTextFromQuoted(m, conn);
          }

          await installPlugin(conn, m, code, usedPrefix, command);
        }
        break;

      case "get":
        await getPlugin(conn, m, rest[0], usedPrefix, command);
        break;

      case "remove":
        await removePlugin(conn, m, rest[0], usedPrefix, command);
        break;

      case "list":
        await listPlugins(conn, m);
        break;

      case "rename":
        await renamePlugin(conn, m, rest[0], rest[1], usedPrefix, command);
        break;

      default:
        await m.reply(
          `📚 *Plugin Manager*\n\n` +
            `• \`${usedPrefix + command} install <code>\` — Install a plugin from code or document\n` +
            `• \`${usedPrefix + command} get <command|file>\` — View plugin code\n` +
            `• \`${usedPrefix + command} remove <file>\` — Delete a plugin\n` +
            `• \`${usedPrefix + command} list\` — List all plugins\n` +
            `• \`${usedPrefix + command} rename <old> <new>\` — Rename a plugin`,
        );
    }
  },
};
