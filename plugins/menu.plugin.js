import config from "../config.js";
import { plugins } from "./index.js";
import chalk from "chalk";
import { Toolkit, Button } from "../utils/MessageBuilderV4.7.js";
import os from "os";

export default {
  name: "Menu Command",
  command: ["menu"],
  owner_only: false,
  private_only: false,
  group_only: false,
  description: "Menampilkan daftar perintah bot berdasarkan kategori",
  category: "main",

  async run(conn, m, { jid, senderName, usedPrefix, senderLid }) {
    try {
      await m.react("🔥");

      const targetJid = jid || m?.chat || m?.key?.remoteJid;
      const sender =
        m?.sender || m?.key?.participant || m?.key?.remoteJid || targetJid;
      const sName = senderName || m?.pushName || "User";

      const date = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const time = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const categorized = {};
      const processedPlugins = new Set();

      for (const [, plugin] of plugins.entries()) {
        if (processedPlugins.has(plugin)) continue;
        processedPlugins.add(plugin);

        let rawCategory = plugin.category;
        if (Array.isArray(rawCategory)) {
          rawCategory = rawCategory[0];
        }

        const category =
          typeof rawCategory === "string"
            ? rawCategory.toLowerCase()
            : "uncategorized";

        if (!categorized[category]) {
          categorized[category] = [];
        }

        const mainCmd = Array.isArray(plugin.command)
          ? plugin.command[0]
          : plugin.command;

        if (mainCmd) {
          categorized[category].push(mainCmd);
        }
      }

      const totalPlugins = processedPlugins.size;

      let menuText =
        `◦ Date    : ${date}\n` +
        `◦ Time    : ${time}\n` +
        `◦ Runtime : ${process.uptime().toFixed(0)}s\n` +
        `◦ Plugins : ${totalPlugins}\n` +
        `◦ Prefix  : ${usedPrefix}\n` +
        `◦ Platform: ${os.platform()}\n\n`;

      for (const [cat, cmds] of Object.entries(categorized)) {
        menuText += `⌈ 𝗠𝗘𝗡𝗨 • ${cat.toUpperCase()} ⌋\n`;
        menuText += cmds
          .sort()
          .map((cmd) => `  • ${usedPrefix}${cmd}`)
          .join("\n");
        menuText += "\n\n";
      }

      let ppBuffer = Buffer.alloc(0);
      try {
        const ppUrl = await conn.profilePictureUrl(sender, "image");
        const ppRes = await fetch(ppUrl);
        if (ppRes.ok) {
          const rawPp = Buffer.from(await ppRes.arrayBuffer());
          ppBuffer = await Toolkit.resize(rawPp, 300, 300);
        }
      } catch (e) {}

      const fakeContactQuote = {
        key: {
          fromMe: false,
          participant: "0@newsletter.id",
          remoteJid: "status@broadcast",
          id: "NOZOMI_QUOTE_ID",
        },
        message: {
          contactMessage: {
            displayName: sName,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${sName};;;\nFN:${sName}\nTEL;type=CELL;type=VOICE;waid=${sender.split("@")[0]}:+${sender.split("@")[0]}\nEND:VCARD`,
            jpegThumbnail: ppBuffer,
          },
        },
      };

      const vidUrl =
        config.bot?.vid_thumb ||
        "https://cdn.ornzora.eu.cc/7e92c9af-9e11-42f1-803c-8c23ecdb0ffe-upload-1786022115577.mp4";
      let vidBuffer = Buffer.alloc(0);
      try {
        const resVid = await fetch(vidUrl);
        if (resVid.ok) {
          vidBuffer = Buffer.from(await resVid.arrayBuffer());
        }
      } catch (e) {}

      const channelContext = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363430152117696@newsletter",
          serverMessageId: 1,
          newsletterName: "Nozomi Channel",
        },
      };

      await new Button(conn)
        .setBody(`🌸 *Halo, @${senderName || "Anonymous"}*\n`)
        .setFooter(
          `${menuText.trim()}\n\n\n© ${config.bot?.name || "Nozomi Base"}`,
        )
        .setMedia({ video: vidBuffer, gifPlayback: true })
        .setContextInfo(channelContext)
        .addSelection("Pilih Opsi")
        .makeSection("Informasi Bot")
        .makeRow("Pingg", "Ping", "nge ping", `ping`)

        .addUrl(
          "View Channel",
          "https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N",
          true,
          {},
        )
        .send(targetJid, { quoted: fakeContactQuote });

      await m.react("👋");
    } catch (err) {
      console.error(chalk.red(err));
      await m.reply("Terjadi kesalahan saat memuat menu.");
    }
  },
};
