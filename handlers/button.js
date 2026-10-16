import config from "../config.js";
import { plugins } from "../plugins/index.js";

function normalizePrefixes(prefixes) {
  if (Array.isArray(prefixes)) return prefixes.filter(Boolean);
  if (typeof prefixes === "string") return prefixes.split("").filter(Boolean);
  return [".", "!", "/", "#"];
}

function parseCommand(text, prefixes) {
  const value = String(text || "").trim();
  if (!value)
    return { isCmd: false, usedPrefix: "", command: "", args: [], body: "" };
  const sortedPrefixes = [...prefixes].sort((a, b) => b.length - a.length);
  const usedPrefix = sortedPrefixes.find((p) => value.startsWith(p)) || "";
  if (!usedPrefix)
    return { isCmd: false, usedPrefix: "", command: "", args: [], body: value };
  const body = value.slice(usedPrefix.length).trim();
  if (!body) return { isCmd: false, usedPrefix, command: "", args: [], body };
  const parts = body.split(/\s+/).filter(Boolean);
  const command = (parts.shift() || "").toLowerCase();
  return { isCmd: Boolean(command), usedPrefix, command, args: parts, body };
}

export async function handleButton(conn, m) {
  const message = m?.message;
  if (!message) return;

  let id = "";

  if (message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
    try {
      const params = JSON.parse(
        message.interactiveResponseMessage.nativeFlowResponseMessage
          .paramsJson || "{}",
      );
      id = params?.id || params?.name || params?.param || "";
    } catch {}
  }

  if (!id && message?.templateButtonReplyMessage?.selectedId) {
    id = message.templateButtonReplyMessage.selectedId;
  }

  if (!id && message?.buttonsResponseMessage?.selectedButtonId) {
    id = message.buttonsResponseMessage.selectedButtonId;
  }

  if (!id && message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
    id = message.listResponseMessage.singleSelectReply.selectedRowId;
  }

  if (!id) return;

  const prefix = Array.isArray(config.bot.prefix) ? config.bot.prefix[0] : ".";

  // console.log(`[BUTTON] param/id: "${id}"`);

  const rawText = id.trim();
  const commandText = rawText.startsWith(prefix)
    ? rawText
    : `${prefix}${rawText}`;

  // console.log(`[BUTTON] Recognized as command: "${commandText}"`);

  const prefixes = normalizePrefixes(config.bot.prefix);
  const parsed = parseCommand(commandText, prefixes);
  const { command, args, usedPrefix, body } = parsed;

  if (!command) return;

  if (!plugins.has(command)) return;

  const jid = m?.jid || m?.chat || m?.key?.remoteJid || "";
  const senderJid = m?.senderJid || "";
  const senderLid = m?.senderLid || "";
  const isOwner = m?.isOwner || false;
  const isAdmin = m?.isAdmin || false;
  const isBotAdmin = m?.isBotAdmin || false;
  const isGroup = m?.isGroup || false;
  const isPrivate = m?.isPrivate || false;
  const isChannel = m?.isChannel || false;
  const isBroadcast = m?.isBroadcast || false;

  const plugin = plugins.get(command);

  if (plugin?.owner_only && !isOwner) {
    return m?.reply?.(
      config.mess?.owner || "Perintah ini hanya dapat digunakan oleh owner.",
    );
  }

  if (plugin?.group_only && !isGroup) {
    return m?.reply?.(
      config.mess?.group || "Perintah ini hanya dapat digunakan di grup.",
    );
  }

  if (plugin?.private_only && !isPrivate) {
    return m?.reply?.(
      config.mess?.private ||
        "Perintah ini hanya dapat digunakan di private chat.",
    );
  }

  // console.log(`[BUTTON] Executing plugin for command: "${command}"`);

  const context = {
    jid,
    remoteJid: jid,
    sender: senderJid || senderLid || jid,
    senderJid,
    senderLid,
    senderName: m?.senderName || "Tanpa Nama",
    senderNumber: m?.senderNumber || "",
    botJid: m?.botJid || "",
    botLid: m?.botLid || "",
    botNumber: m?.botNumber || "",
    command,
    args,
    arg: args.join(" "),
    usedPrefix,
    prefix: usedPrefix,
    formattedLid: senderLid,
    isOwner,
    isAdmin,
    isBotAdmin,
    isGroup,
    isPrivate,
    isBroadcast,
    isChannel,
    isFromMe: m?.isFromMe || false,
    isCmd: true,
    type: m?.type || "",
    text: commandText,
    body,
    quoted: m?.quoted || null,
    quotedMessage: m?.quotedMessage || null,
    quotedContent: m?.quotedContent || null,
    quotedType: m?.quotedType || null,
    quotedText: m?.quotedText || "",
    mentionedJid: m?.mentionedJid || [],
    mentions: m?.mentionedJid || [],
    groupMetadata: null,
    participants: [],
    isImage: false,
    isVideo: false,
    isAudio: false,
    isDocument: false,
    isSticker: false,
    isMedia: false,
    mediaType: null,
    media: null,
    mimetype: null,
    fileName: null,
    caption: null,
  };

  try {
    await conn.sendPresenceUpdate("recording", jid);
    await plugin.run(conn, m, context);
    await conn.sendPresenceUpdate("available", jid);
  } catch (error) {
    console.error(`[BUTTON EXEC ERROR] Command ${command}:`, error);
    try {
      await conn.sendPresenceUpdate("available", jid);
    } catch {}
    try {
      await m.reply?.("Terjadi kesalahan saat menjalankan perintah tersebut.");
    } catch {}
  }
}
