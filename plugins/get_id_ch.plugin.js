import config from "../config.js";
import { Button } from "../utils/MessageBuilderV4.7.js";

export default {
  name: "Get Channel ID",
  command: ["getchid", "getchannelid", "chid"],
  owner_only: false,
  private_only: false,
  group_only: false,
  description: "Mengambil ID dari tautan WhatsApp Channel / Saluran",
  category: "tools",

  async run(conn, m, { jid, args, usedPrefix }) {
    try {
      const url = args[0];

      if (!url) {
        return await m.reply(
          `❌ Silakan masukkan tautan channel WhatsApp!\n\n> *Contoh:* ${usedPrefix}getchid https://whatsapp.com/channel/023847293847XYZ`,
        );
      }

      if (!url.includes("whatsapp.com/channel/")) {
        return await m.reply(
          "❌ Tautan tidak valid! Pastikan itu adalah link WhatsApp Channel yang benar.",
        );
      }
      const channelCode = url.split("channel/")[1]?.split("?")[0];

      if (!channelCode) {
        return await m.reply(
          "❌ Gagal mengekstrak kode channel dari tautan tersebut.",
        );
      }

      let channelId = "Tidak dapat mendeteksi ID secara langsung";
      let channelName = "Unknown Channel";
      let subscribers = "Tidak diketahui";

      try {
        const metadata = await conn.newsletterMetadata("invite", channelCode);
        if (metadata) {
          channelId = metadata.id || `${channelCode}@newsletter`;
          channelName = metadata.name || "Tidak ada nama";
          subscribers = metadata.subscribers || "Tidak diketahui";
        }
      } catch (e) {
        channelId = `${channelCode}@newsletter`;
      }

      let text = `╭━━━〔 📡 *CHANNEL INFO* 〕━━━\n`;
      text += `┃ \n`;
      text += `┃ 🏷️ *Nama:* ${channelName}\n`;
      text += `┃ 🆔 *Channel ID:* ${channelId}\n`;
      text += `┃ 👥 *Pengikut:* ${subscribers}\n`;
      text += `┃ 🔗 *Kode:* ${channelCode}\n`;
      text += `┃ \n`;
      text += `╰━━━━━━━━━━━━━━━━━\n\n`;
      text += `> *Gunakan ID di atas untuk keperluan integrasi atau bot.*`;

      await new Button(conn)
        .setFooter(text)
        .addCopy("📋 Copy ID", channelId, { icon: "DOCUMENT" })
        .send(jid, { quoted: m });
    } catch (err) {
      console.error("Gagal mendapatkan Channel ID:", err);
      await m.reply("Terjadi kesalahan saat memproses tautan channel.");
    }
  },
};
