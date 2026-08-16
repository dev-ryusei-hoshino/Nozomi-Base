import chalk from "chalk";
import axios from "axios";
import fetch from "node-fetch";
import {
  uploadLitterbox,
  uploadGofile,
  uploadQuax,
  uploadTmpFiles,
  uploadPutIcu,
  uploadOrnzora,
} from "../scrape/uploader.js";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";
import config from "../config.js";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

const SERVICES = [
  {
    name: "Ornzora",
    emoji: "🌐",
    fn: uploadOrnzora,
    note: "CDN Publik Permanen",
  },
  {
    name: "Litterbox",
    emoji: "🗃️",
    fn: uploadLitterbox,
    note: "Expires 72 jam",
  },
  { name: "Gofile", emoji: "🗂️", fn: uploadGofile, note: "Permanen" },
  { name: "Qu.ax", emoji: "🔗", fn: uploadQuax, note: "Permanen" },
  { name: "TmpFiles", emoji: "⏳", fn: uploadTmpFiles, note: "Expires 24 jam" },
  { name: "Put.icu", emoji: "📡", fn: uploadPutIcu, note: "Expires 1 hari" },
];

export default {
  name: "To URL",
  command: ["tourl"],
  description: "Upload media ke berbagai file host",
  category: "tools",

  async run(conn, m, { jid, usedPrefix }) {
    try {
      const txt = [
        "╭──「 📤 *Upload File* 」",
        "│",
        "│ Reply file/foto/video lalu ketik:",
        `│ *${usedPrefix}tourl*`,
        "│",
        "│ 📌 *Layanan tersedia:*",
        "│ 🌐 Ornzora   — CDN Publik Permanen",
        "│ 🗃️ Litterbox — 72 jam",
        "│ 🗂️ Gofile    — Permanen",
        "│ 🔗 Qu.ax     — Permanen",
        "│ ⏳ TmpFiles  — 24 jam",
        "│ 📡 Put.icu   — 1 hari",
        "│",
        "│ Semua diupload sekaligus!",
        "╰─────────────────────",
      ].join("\n");

      let quoted =
        m?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
        m?.extendedTextMessage?.contextInfo?.quotedMessage;
      let mediaMessage = null;

      if (quoted) {
        mediaMessage = {
          key: m.key,
          message: quoted,
        };
      } else if (
        m.imageMessage ||
        m.videoMessage ||
        m.audioMessage ||
        m.documentMessage
      ) {
        mediaMessage = {
          key: m.key,
          message: m,
        };
      } else {
        return m.reply(txt);
      }

      const buffer = await downloadMediaMessage(
        mediaMessage,
        "buffer",
        {},
        {
          logger: undefined,
          reuploadRequest: conn.updateMediaMessage,
        },
      );

      await m.react("⏳");

      if (!buffer?.length) {
        throw new Error("Buffer kosong");
      }

      const ft = await fileTypeFromBuffer(buffer);
      const ext = ft?.ext || "bin";
      const fileName = `upload-${Date.now()}`;

      const size =
        buffer.length >= 1024 * 1024
          ? `${(buffer.length / 1024 / 1024).toFixed(2)} MB`
          : `${(buffer.length / 1024).toFixed(1)} KB`;

      await m.react("⚙️");

      const results = await Promise.allSettled(
        SERVICES.map((svc) => svc.fn(buffer, fileName)),
      );

      let text =
        "╭──「 📤 *Upload Result* 」\n" +
        `│ 📁 \`${fileName}.${ext}\` • ${size}\n` +
        "│\n";

      let success = false;

      for (let i = 0; i < SERVICES.length; i++) {
        const svc = SERVICES[i];
        const res = results[i];

        if (res.status === "fulfilled") {
          success = true;

          text +=
            `│ ${svc.emoji} *${svc.name}* ✅ — ${svc.note}\n` +
            `│ 🔗 ${res.value}\n│\n`;
        } else {
          text += `│ ${svc.emoji} *${svc.name}* ❌ — ${
            res.reason?.message || "gagal"
          }\n│\n`;
        }
      }

      text += "╰─────────────────────";

      await conn.sendMessage(jid, { text }, { quoted: m });

      await m.react(success ? "✅" : "❌");
    } catch (e) {
      console.log(e);
    }
  },
};
