import chalk from "chalk";
import { performance } from "perf_hooks";
import { AIRich } from "../utils/MessageBuilderV4.6.js";
import config from "../config.js";
import axios from "axios";
import os from "os";

export default {
  name: "Ping Command",
  command: ["ping", "p"],
  owner_only: false,
  private_only: false,
  group_only: false,
  description: "Tes kecepatan respon bot (latency)",
  category: "main",

  async run(conn, m, { jid, senderJid }) {
    try {
      const start = performance.now();
      const end = performance.now();
      const latency = (end - start).toFixed(2);
      const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
      const ramFree = (os.freemem() / 1024 / 1024).toFixed(0);
      await new AIRich(conn)
        .addText(`# P O N G ! 🏓`)
        .addTip(
          `⚡ Latency: ${latency} ms\n💻 RAM: ${ramFree} MB / ${ramTotal} MB free`,
        )
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
    } catch (e) {
      console.error(chalk.red("[Ping Error]:"), e);
      await m.reply("Gagal menghitung ping.");
    }
  },
};
