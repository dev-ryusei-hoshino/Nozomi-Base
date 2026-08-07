import config from "../config.js";
import { plugins } from "../plugins/index.js";
import sharp from "sharp";
import chalk from "chalk";
import axios from "axios";
import { Button } from "../utils/MessageBuilderV4.6.js";
import os from "os";

export default {
  name: "Menu Command",
  command: ["menu", "help", "list"],
  owner_only: false,
  private_only: false,
  group_only: false,
  description: "Menampilkan daftar perintah bot berdasarkan kategori",
  category: "main",

  async run(conn, m, { jid, senderName, formattedLid, usedPrefix }) {
    try {
      m.react("🔥");
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

      let menuText = `
◦ Date    : ${date}
◦ Time    : ${time}
◦ Runtime : ${process.uptime().toFixed(0)}s
◦ Plugins : ${totalPlugins}
◦ Prefix  : ${usedPrefix}
◦ Platform: ${os.platform()}

`;

      for (const [cat, cmds] of Object.entries(categorized)) {
        menuText += `⌈ 𝗠𝗘𝗡𝗨 • ${cat.toUpperCase()} ⌋\n`;

        menuText += cmds
          .sort()
          .map((cmd) => `  • ${usedPrefix}${cmd}`)
          .join("\n");

        menuText += "\n\n";
      }

      menuText += `\n© ${config.bot.name}`;
      await new Button(conn)
        .setTitle(`Halo, ${senderName}`)
        .setFooter(menuText)
        .setImage(config.bot.thumb)
        .addUrl(
          "View Channel",
          "https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N",
          true,
          {},
        )
        .send(jid, {
          quoted: {
            key: {
              fromMe: false,
              participant: "0@s.whatsapp.net",
              id: "TEXT123",
            },
            message: {
              extendedTextMessage: {
                text: config.bot.slog,
                contextInfo: {
                  isForwarded: true,
                  forwardingScore: 1,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363430152117696@newsletter",
                    serverMessageId: 1,
                    newsletterName: "Nozomi Channel",
                  },
                },
              },
            },
          },
        });

      await m.react("👋");
    } catch (err) {
      console.error(chalk.red(err));
      await m.reply("Terjadi kesalahan saat memuat menu.");
    }
  },
};
