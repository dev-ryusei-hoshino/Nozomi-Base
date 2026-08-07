import config from "../config.js";
import { plugins } from "../plugins/index.js";
import axios from "axios";
import { Button } from "../utils/MessageBuilderV4.6.js";
import chalk from "chalk";

function getDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function findClosest(input, list) {
  let closest = null;
  let minDistance = Infinity;
  for (const item of list) {
    const dist = getDistance(input, item);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }
  return minDistance <= 2 ? closest : null;
}

export async function handleMessage(conn, msg) {
  try {
    const isMe = msg.key.fromMe;

    if (!msg.message) return;
    if (config.ignore_self && isMe) return;

    const mess =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!mess) return;

    const remoteJid = msg.key.remoteJid || "";
    const isGroup = remoteJid.endsWith("@g.us");
    const isChannel = remoteJid.endsWith("@newsletter");
    const isBroadcast =
      remoteJid === "status@broadcast" || msg.broadcast === true;
    const isPrivate = !isGroup && !isChannel && !isBroadcast;

    let isAdmin = false;
    let isBotAdmin = false;
    let isOwner = false;
    let isCmd = false;
    let usedPrefix = "";
    let command = "";
    let args = [];

    const m = {
      key: msg.key,
      message: msg.message,
      react: async (emoji) => {
        await conn.sendMessage(remoteJid, {
          react: { text: emoji, key: msg.key },
        });
      },
      reply: async (teks) => {
        await conn.sendMessage(remoteJid, { text: teks }, { quoted: msg });
      },
    };

    const ids = [
      m.key.participant,
      m.key.participantAlt,
      m.key.remoteJid,
      m.key.remoteJidAlt,
    ];

    let senderLid = ids.find((id) => id && id.includes("@lid"));
    let senderJid = ids.find((id) => id && id.includes("@s.whatsapp.net"));
    let jid =
      isGroup || isChannel || isBroadcast ? remoteJid : senderJid || remoteJid;

    const rawBotJid = conn.user.id;
    const botLid = conn.user.lid;
    const botJid = rawBotJid ? rawBotJid.split(":")[0] + "@s.whatsapp.net" : "";
    let formattedLid = senderLid;
    const botNumber = rawBotJid ? rawBotJid.split(":")[0] : "";

    if (isMe) {
      senderLid = botLid || senderLid;
      senderJid = botJid || senderJid;
    }

    if (isGroup) {
      const groupMetadata = await conn.groupMetadata(remoteJid);
      const participants = groupMetadata.participants;

      if (!senderJid && senderLid) {
        const pData = participants.find((p) => p.id === senderLid);
        if (pData && pData.phoneNumber) {
          senderJid = pData.phoneNumber + "@s.whatsapp.net";
        }
      }

      const checkAdmin =
        participants.find((p) => p.id === senderLid) ||
        participants.find((n) => n.id === senderJid);

      isAdmin =
        checkAdmin?.admin === "admin" || checkAdmin?.admin === "superadmin";

      const checkBotAdmin =
        participants.find((p) => p.id === botLid) ||
        participants.find((n) => n.id === botJid);

      isBotAdmin =
        checkBotAdmin?.admin === "admin" ||
        checkBotAdmin?.admin === "superadmin";
    }

    const senderNumber = senderJid
      ? senderJid.replace("@s.whatsapp.net", "")
      : "";
    const senderName = msg.verifiedBizName || msg.pushName || "Tanpa Nama";
    if (senderNumber === config.bot.owner.number) isOwner = true;
    const prefixes = config.bot.prefix;

    let type;
    if (isGroup) {
      type = chalk.green("[GROUP]");
    } else if (isPrivate) {
      type = chalk.cyan("[PRIVATE]");
    } else if (isBroadcast) {
      type = chalk.blue("[BROADCAST]");
    } else {
      type = chalk.magenta("[UNKNOWN]");
    }

    if (config.auto_read) await conn.readMessages([m.key]);
    if (!isChannel)
      console.log(
        "[NEW MESSAGE]",
        type,
        `${chalk.yellow(senderName)} ${chalk.gray(`(${senderNumber})`)}\n${chalk.yellow(">")} ${mess}\n`,
      );

    for (const p of prefixes) {
      if (mess.startsWith(p)) {
        isCmd = true;
        usedPrefix = p;
        break;
      }
    }

    if (isCmd) {
      const splitMsg = mess.slice(usedPrefix.length).trim().split(/ +/);
      command = splitMsg.shift().toLowerCase();
      args = splitMsg;
    }

    if (isCmd && plugins.has(command)) {
      const plugin = plugins.get(command);

      if (plugin.owner_only && !isOwner) {
        return await m.reply(config.mess.owner);
      }
      if (plugin.group_only && !isGroup) {
        return await m.reply(config.mess.group);
      }
      if (plugin.private_only && !isPrivate) {
        return await m.reply(config.mess.private);
      }

      const context = {
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
      };

      try {
        await conn.sendPresenceUpdate("recording", jid);
        await plugin.run(conn, m, context);
        await conn.sendPresenceUpdate("available", jid);
      } catch (err) {
        console.error(`[EXEC ERROR] Command ${command}:`, err);
        await m.reply("Terjadi kesalahan saat menjalankan perintah tersebut.");
      }
    } else if (isCmd && !plugins.has(command)) {
      await conn.sendPresenceUpdate("recording", jid);
      const allCommands = Array.from(plugins.keys());
      const suggestion = findClosest(command, allCommands);

      const text = suggestion
        ? `\`\`\`Command tidak ditemukan\`\`\`\n> Mungkin: ${usedPrefix}${suggestion}`
        : `\`\`\`Command tidak ditemukan\`\`\`\n> Ketik: ${usedPrefix}menu`;

      try {
        await new Button(conn)
          .setTitle("❌ Error 404")
          .setBody(text)
          .addButton("inapp_signup", {})
          .send(jid, {
            quoted: {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                id: "PRODUCT123",
              },
              message: {
                locationMessage: {
                  degreesLatitude: -6.2,
                  degreesLongitude: 106.816666,
                  name: config.bot.name,
                  address: "Jakarta, Indonesia",
                },
              },
            },
          });

        await conn.sendPresenceUpdate("available", jid);
      } catch (err) {
        console.error("Gagal mengirim fake product:", err);
        await m.reply(text);
      }
    }
  } catch (error) {
    console.error("Terjadi kesalahan di handler pesan:", error);
  }
}
