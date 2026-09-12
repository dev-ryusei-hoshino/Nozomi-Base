import config from "../config.js";
import { plugins } from "../plugins/index.js";
import axios from "axios";
import { getRuntimeValue, setRuntimeValue } from "../utils/runtime.js";
import packageFile from "../package.json" with { type: "json" };
import fs from "fs";
import { Button } from "../utils/MessageBuilderV4.7.js";
import chalk from "chalk";

function getDistance(a, b) {
  const matrix = Array.from(
    { length: a.length + 1 },
    () => Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function findClosest(input, list) {
  let closest = null;
  let minDistance = Infinity;

  for (const item of list) {
    const distance = getDistance(
      input.toLowerCase(),
      item.toLowerCase()
    );

    if (distance < minDistance) {
      minDistance = distance;
      closest = item;
    }
  }

  return minDistance <= 2 ? closest : null;
}

function getContentType(message) {
  if (!message || typeof message !== "object") return null;

  const ignored = [
    "messageContextInfo",
    "senderKeyDistributionMessage",
    "protocolMessage",
    "ephemeralMessage",
    "viewOnceMessage",
    "viewOnceMessageV2",
    "documentWithCaptionMessage",
  ];

  const type = Object.keys(message).find(
    (key) => !ignored.includes(key)
  );

  return type || Object.keys(message)[0] || null;
}

function unwrapMessage(message) {
  if (!message) return null;

  if (message.ephemeralMessage?.message) {
    return unwrapMessage(message.ephemeralMessage.message);
  }

  if (message.viewOnceMessage?.message) {
    return unwrapMessage(message.viewOnceMessage.message);
  }

  if (message.viewOnceMessageV2?.message) {
    return unwrapMessage(message.viewOnceMessageV2.message);
  }

  if (message.viewOnceMessageV2Extension?.message) {
    return unwrapMessage(message.viewOnceMessageV2Extension.message);
  }

  if (message.documentWithCaptionMessage?.message) {
    return unwrapMessage(message.documentWithCaptionMessage.message);
  }

  return message;
}

function getContextInfo(message) {
  const content = unwrapMessage(message);

  if (!content) return {};

  const type = getContentType(content);

  return content?.[type]?.contextInfo || {};
}

function getText(message) {
  const content = unwrapMessage(message);

  if (!content) return "";

  const type = getContentType(content);
  const data = content?.[type];

  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedButtonId ||
    content.buttonsResponseMessage?.selectedDisplayText ||
    content.listResponseMessage?.singleSelectReply?.selectedRowId ||
    content.listResponseMessage?.title ||
    content.templateButtonReplyMessage?.selectedId ||
    content.templateButtonReplyMessage?.selectedDisplayText ||
    content.interactiveResponseMessage?.nativeFlowResponseMessage
      ?.paramsJson ||
    data?.caption ||
    ""
  );
}

function getQuoted(message) {
  const contextInfo = getContextInfo(message);

  return contextInfo?.quotedMessage || null;
}

function getMediaType(type) {
  const mediaTypes = {
    imageMessage: "image",
    videoMessage: "video",
    audioMessage: "audio",
    documentMessage: "document",
    stickerMessage: "sticker",
  };

  return mediaTypes[type] || null;
}

function normalizeJid(jid) {
  if (!jid) return "";

  if (jid.includes(":")) {
    const [user, server] = jid.split("@");
    const number = user.split(":")[0];

    return `${number}@${server || "s.whatsapp.net"}`;
  }

  return jid;
}

function getPhoneNumber(jid) {
  if (!jid) return "";

  return jid
    .replace("@s.whatsapp.net", "")
    .replace("@c.us", "")
    .replace("@lid", "")
    .replace(/:.+$/, "");
}

function normalizePrefixes(prefixes) {
  if (Array.isArray(prefixes)) {
    return prefixes.filter(Boolean);
  }

  if (typeof prefixes === "string") {
    return prefixes
      .split("")
      .filter(Boolean);
  }

  return [".", "!", "/", "#"];
}

function parseCommand(text, prefixes) {
  const value = String(text || "").trim();

  if (!value) {
    return {
      isCmd: false,
      usedPrefix: "",
      command: "",
      args: [],
      body: "",
    };
  }

  const sortedPrefixes = [...prefixes].sort(
    (a, b) => b.length - a.length
  );

  const usedPrefix =
    sortedPrefixes.find((prefix) =>
      value.startsWith(prefix)
    ) || "";

  if (!usedPrefix) {
    return {
      isCmd: false,
      usedPrefix: "",
      command: "",
      args: [],
      body: value,
    };
  }

  const body = value
    .slice(usedPrefix.length)
    .trim();

  if (!body) {
    return {
      isCmd: false,
      usedPrefix,
      command: "",
      args: [],
      body,
    };
  }

  const parts = body
    .split(/\s+/)
    .filter(Boolean);

  const command = (
    parts.shift() || ""
  ).toLowerCase();

  return {
    isCmd: Boolean(command),
    usedPrefix,
    command,
    args: parts,
    body,
  };
}

export async function handleMessage(conn, msg) {
  try {
    if (!msg?.message || !msg?.key) return;

    const isMe = Boolean(msg.key.fromMe);

    if (config.ignore_self && isMe) return;

    const remoteJid =
      msg.key.remoteJid ||
      msg.key.remoteJidAlt ||
      "";

    if (!remoteJid) return;

    const isGroup =
      remoteJid.endsWith("@g.us");

    const isChannel =
      remoteJid.endsWith("@newsletter");

    const isBroadcast =
      remoteJid === "status@broadcast" ||
      msg.broadcast === true;

    const isPrivate =
      !isGroup &&
      !isChannel &&
      !isBroadcast;

    const content =
      unwrapMessage(msg.message);

    if (!content) return;

    const type =
      getContentType(content);

    const contextInfo =
      getContextInfo(msg.message);

    const mess =
      getText(msg.message).trim();

    const quotedMessage =
      getQuoted(msg.message);

    const quotedContent =
      quotedMessage
        ? unwrapMessage(quotedMessage)
        : null;

    const quotedType =
      quotedContent
        ? getContentType(quotedContent)
        : null;

    const prefixes =
      normalizePrefixes(
        config.bot?.prefix
      );

    const parsed =
      parseCommand(
        mess,
        prefixes
      );

    let {
      isCmd,
      usedPrefix,
      command,
      args,
      body,
    } = parsed;

    let isAdmin = false;
    let isBotAdmin = false;
    let isOwner = false;

    const ids = [
      msg.key.participant,
      msg.key.participantAlt,
      msg.key.remoteJidAlt,
      msg.key.remoteJid,
    ].filter(Boolean);

    let senderLid =
      ids.find((id) =>
        id.includes("@lid")
      ) || "";

    let senderJid =
      ids.find((id) =>
        id.includes("@s.whatsapp.net")
      ) || "";

    const rawBotJid =
      conn.user?.id || "";

    const rawBotLid =
      conn.user?.lid || "";

    const botJid =
      normalizeJid(rawBotJid);

    const botLid =
      rawBotLid ||
      "";

    const botNumber =
      getPhoneNumber(botJid);

    if (isMe) {
      senderLid =
        botLid ||
        senderLid;

      senderJid =
        botJid ||
        senderJid;
    }

    let jid =
      isGroup ||
      isChannel ||
      isBroadcast
        ? remoteJid
        : senderJid ||
          senderLid ||
          remoteJid;

    let groupMetadata = null;
    let participants = [];

    if (isGroup) {
      try {
        groupMetadata =
          await conn.groupMetadata(
            remoteJid
          );

        participants =
          groupMetadata?.participants ||
          [];

        if (!senderJid && senderLid) {
          const senderParticipant =
            participants.find(
              (participant) =>
                participant.id === senderLid
            );

          if (
            senderParticipant?.phoneNumber
          ) {
            senderJid =
              normalizeJid(
                senderParticipant.phoneNumber
              );
          }
        }

        const senderParticipant =
          participants.find(
            (participant) =>
              participant.id === senderLid
          ) ||
          participants.find(
            (participant) =>
              normalizeJid(
                participant.phoneNumber
              ) === senderJid
          ) ||
          participants.find(
            (participant) =>
              participant.id === senderJid
          );

        isAdmin =
          senderParticipant?.admin === "admin" ||
          senderParticipant?.admin === "superadmin" ||
          senderParticipant?.admin === "owner";

        const botParticipant =
          participants.find(
            (participant) =>
              participant.id === botLid
          ) ||
          participants.find(
            (participant) =>
              normalizeJid(
                participant.phoneNumber
              ) === botJid
          ) ||
          participants.find(
            (participant) =>
              participant.id === botJid
          );

        isBotAdmin =
          botParticipant?.admin === "admin" ||
          botParticipant?.admin === "superadmin" ||
          botParticipant?.admin === "owner";
      } catch (error) {
        console.error(
          "[GROUP METADATA ERROR]",
          error
        );
      }
    }

    const formattedLid =
      senderLid || "";

    const senderNumber =
      getPhoneNumber(senderJid);

    const senderName =
      msg.verifiedBizName ||
      msg.pushName ||
      "Tanpa Nama";

    const ownerNumber =
      String(
        config.bot?.owner?.number || ""
      ).replace(/\D/g, "");

    isOwner =
      Boolean(
        ownerNumber &&
        senderNumber &&
        senderNumber === ownerNumber
      ) ||
      Boolean(
        senderLid &&
        botLid &&
        senderLid === botLid
      ) ||
      Boolean(
        senderJid &&
        botJid &&
        normalizeJid(senderJid) ===
          normalizeJid(botJid)
      );

    const media =
      content?.[type] || null;

    const mentionedJid =
      contextInfo?.mentionedJid || [];

    const mediaType =
      getMediaType(type);

    const m = {
      chat: remoteJid,

      jid,

      sender:
        senderJid ||
        senderLid ||
        remoteJid,

      senderJid,

      senderLid,

      senderNumber,

      senderName,

      botJid,

      botLid,

      botNumber,

      key: msg.key,

      id: msg.key?.id || "",

      message: msg.message,

      raw: msg,

      type,

      content,

      text: mess,

      mess,

      body,

      prefix: usedPrefix,

      usedPrefix,

      command,

      args,

      arg: args.join(" "),

      isCommand: isCmd,

      isCmd,

      isGroup,

      isPrivate,

      isChannel,

      isBroadcast,

      isFromMe: isMe,

      isOwner,

      isAdmin,

      isBotAdmin,

      contextInfo,

      mentionedJid,

      mentions: mentionedJid,

      hasQuoted:
        Boolean(quotedMessage),

      quoted:
        quotedMessage,

      quotedMessage,

      quotedContent,

      quotedType,

      quotedText:
        quotedMessage
          ? getText(quotedMessage)
          : "",

      quotedSender:
        contextInfo?.participant ||
        contextInfo?.remoteJid ||
        null,

      isImage:
        type === "imageMessage",

      isVideo:
        type === "videoMessage",

      isAudio:
        type === "audioMessage",

      isDocument:
        type === "documentMessage",

      isSticker:
        type === "stickerMessage",

      isMedia:
        Boolean(mediaType),

      mediaType,

      media,

      mimetype:
        media?.mimetype ||
        null,

      fileName:
        media?.fileName ||
        null,

      caption:
        media?.caption ||
        null,

      timestamp:
        Number(
          msg.messageTimestamp || 0
        ),

      pushName:
        msg.pushName ||
        senderName,

      verifiedBizName:
        msg.verifiedBizName ||
        null,

      send: async (
        content,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          content,
          options
        );
      },

      reply: async (
        text,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            text: String(text),
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      react: async (emoji) => {
        return conn.sendMessage(
          remoteJid,
          {
            react: {
              text: String(emoji),
              key: msg.key,
            },
          }
        );
      },

      delete: async () => {
        return conn.sendMessage(
          remoteJid,
          {
            delete: msg.key,
          }
        );
      },

      edit: async (text) => {
        return conn.sendMessage(
          remoteJid,
          {
            text: String(text),
            edit: msg.key,
          }
        );
      },

      sendText: async (
        text,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            text: String(text),
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      sendImage: async (
        image,
        caption = "",
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            image,
            caption,
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      sendVideo: async (
        video,
        caption = "",
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            video,
            caption,
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      sendAudio: async (
        audio,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            audio,
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      sendDocument: async (
        document,
        fileName,
        mimetype,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            document,
            fileName,
            mimetype,
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      sendSticker: async (
        sticker,
        options = {}
      ) => {
        return conn.sendMessage(
          remoteJid,
          {
            sticker,
            ...options,
          },
          {
            quoted: msg,
          }
        );
      },

      typing: async () => {
        return conn.sendPresenceUpdate(
          "composing",
          jid
        );
      },

      recording: async () => {
        return conn.sendPresenceUpdate(
          "recording",
          jid
        );
      },

      pause: async () => {
        return conn.sendPresenceUpdate(
          "paused",
          jid
        );
      },

      available: async () => {
        return conn.sendPresenceUpdate(
          "available",
          jid
        );
      },

      getGroupMetadata: async () => {
        if (!isGroup) return null;

        if (groupMetadata) {
          return groupMetadata;
        }

        return conn.groupMetadata(
          remoteJid
        );
      },

      getParticipants: async () => {
        if (!isGroup) return [];

        if (participants.length) {
          return participants;
        }

        const metadata =
          await conn.groupMetadata(
            remoteJid
          );

        return metadata?.participants || [];
      },

      getParticipant: async (
        participantJid
      ) => {
        if (!isGroup) return null;

        const list =
          await m.getParticipants();

        return (
          list.find(
            (participant) =>
              participant.id ===
              participantJid
          ) ||
          list.find(
            (participant) =>
              normalizeJid(
                participant.phoneNumber
              ) ===
              normalizeJid(
                participantJid
              )
          ) ||
          null
        );
      },

      isMentioned: (jid) => {
        return mentionedJid.includes(jid);
      },

      getMention: (index = 0) => {
        return (
          mentionedJid[index] ||
          null
        );
      },

      hasArgs: (amount = 1) => {
        return (
          args.length >= amount
        );
      },

      getArg: (index) => {
        return args[index];
      },

      getArgs: (start = 0) => {
        return args.slice(start);
      },

      getText: () => {
        return mess;
      },

      getContent: () => {
        return content;
      },

      getQuoted: () => {
        return quotedMessage;
      },

      getQuotedText: () => {
        return quotedMessage
          ? getText(quotedMessage)
          : "";
      },
    };

    const logType =
      isGroup
        ? chalk.green("[GROUP]")
        : isPrivate
          ? chalk.cyan("[PRIVATE]")
          : isBroadcast
            ? chalk.blue("[BROADCAST]")
            : isChannel
              ? chalk.magenta("[CHANNEL]")
              : chalk.gray("[UNKNOWN]");

    const autoRead =
      await getRuntimeValue(
        "auto_read"
      );

    if (autoRead === true) {
      try {
        await conn.readMessages([
          m.key,
        ]);
      } catch (error) {
        console.error(
          "[READ ERROR]",
          error
        );
      }
    }

    if (!isChannel) {
      console.log(
        "[NEW MESSAGE]",
        logType,
        `${chalk.yellow(senderName)} ${chalk.gray(
          `(${senderNumber || "unknown"})`
        )}\n${chalk.yellow(">")} ${mess}\n`
      );
    }

    if (!isCmd) return;

    const isSelf =
      await getRuntimeValue(
        "self"
      );

    if (
      isSelf === true &&
      !isOwner
    ) {
      return;
    }

    if (!plugins.has(command)) {
      await conn.sendPresenceUpdate(
        "recording",
        jid
      );

      const allCommands =
        Array.from(
          plugins.keys()
        );

      const suggestion =
        findClosest(
          command,
          allCommands
        );

      const errorText = suggestion
        ? `\`\`\`Command tidak ditemukan\`\`\`\n> Mungkin: ${usedPrefix}${suggestion}`
        : `\`\`\`Command tidak ditemukan\`\`\`\n> Ketik: ${usedPrefix}menu`;

      try {
        await new Button(conn)
          .setTitle("❌ Error 404")
          .setBody(errorText)
          .addButton(
            "inapp_signup",
            {}
          )
          .send(jid, {
            quoted: {
              key: {
                fromMe: false,
                participant:
                  "0@s.whatsapp.net",
                remoteJid,
                id: "PRODUCT123",
              },
              message: {
                locationMessage: {
                  degreesLatitude:
                    -6.2,
                  degreesLongitude:
                    106.816666,
                  name:
                    config.bot?.name ||
                    "Bot",
                  address:
                    "Jakarta, Indonesia",
                },
              },
            },
          });

        await conn.sendPresenceUpdate(
          "available",
          jid
        );
      } catch (error) {
        console.error(
          "[FAKE PRODUCT ERROR]",
          error
        );

        await m.reply(
          errorText
        );

        await conn.sendPresenceUpdate(
          "available",
          jid
        );
      }

      return;
    }

    const plugin =
      plugins.get(command);

    if (!plugin) return;

    if (
      plugin.owner_only &&
      !isOwner
    ) {
      return m.reply(
        config.mess?.owner ||
          "Perintah ini hanya dapat digunakan oleh owner."
      );
    }

    if (
      plugin.group_only &&
      !isGroup
    ) {
      return m.reply(
        config.mess?.group ||
          "Perintah ini hanya dapat digunakan di grup."
      );
    }

    if (
      plugin.private_only &&
      !isPrivate
    ) {
      return m.reply(
        config.mess?.private ||
          "Perintah ini hanya dapat digunakan di private chat."
      );
    }

    const context = {
      jid,

      remoteJid,

      sender:
        senderJid ||
        senderLid ||
        remoteJid,

      senderJid,

      senderLid,

      senderName,

      senderNumber,

      botJid,

      botLid,

      botNumber,

      command,

      args,

      arg: args.join(" "),

      usedPrefix,

      prefix: usedPrefix,

      formattedLid,

      isOwner,

      isAdmin,

      isBotAdmin,

      isGroup,

      isPrivate,

      isBroadcast,

      isChannel,

      isFromMe: isMe,

      isCmd,

      type,

      text: mess,

      body,

      quoted: quotedMessage,

      mentionedJid,

      groupMetadata,

      participants,
    };

    try {
      await conn.sendPresenceUpdate(
        "recording",
        jid
      );

      await plugin.run(
        conn,
        m,
        context
      );

      await conn.sendPresenceUpdate(
        "available",
        jid
      );
    } catch (error) {
      console.error(
        `[EXEC ERROR] Command ${command}:`,
        error
      );

      try {
        await conn.sendPresenceUpdate(
          "available",
          jid
        );
      } catch {}

      try {
        await m.reply(
          "Terjadi kesalahan saat menjalankan perintah tersebut."
        );
      } catch (replyError) {
        console.error(
          "[REPLY ERROR]",
          replyError
        );
      }
    }
  } catch (error) {
    console.error(
      "Terjadi kesalahan di handler pesan:",
      error
    );
  }
}
