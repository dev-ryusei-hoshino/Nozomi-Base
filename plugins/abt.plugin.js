import config from "../config.js";
import { Button } from "../utils/MessageBuilderV4.7.js";

export default {
  name: "ABT - Button Test",
  command: ["abt", "buttontest"],
  owner_only: false,
  private_only: false,
  group_only: false,
  description: "Test ketiga tipe tombol: addReply, addButton, makeRow",
  category: "main",

  async run(conn, m, { jid, usedPrefix }) {
    try {
      await new Button(conn)
        .setTitle("🔧 ABT Button Test")
        .setBody("Test ketiga tipe tombol dari MessageBuilder")
        .setFooter(`© ${config.bot?.name || "Nozomi Base"}`)
        .addReply("📨 Test To URL", ".tourl", { icon: "REVIEW" })
        .addButton("🌐 Test Get Chat ID", { id: ".getchid" })
        .addSelection("⚙️ Pilih Test")
        .makeSection("Test Ping")
        .makeRow("⚡ Ping", "Test ping", "Tes latency bot", ".ping")
        .send(jid, { quoted: m });
    } catch (e) {
      console.error(e);
      await m.reply("Gagal mengirim tombol test.");
    }
  },
};
