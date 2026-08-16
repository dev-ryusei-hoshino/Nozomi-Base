import fs from "fs";
import { getRuntimeValue, setRuntimeValue } from "../utils/runtime.js";

export default {
  name: "Toggle Auto Read",
  command: ["autoread"],
  category: "owner",
  owner_only: true,
  async run(conn, m, { jid, args, command, usedPrefix }) {
    const query = args[0]?.toLowerCase();

    const autoRead = getRuntimeValue("auto_read");

    if (query === "true" || query === "on") {
      if (autoRead === true) {
        await m.reply("Already activated!");
        await m.react("🚫");
      } else {
        await m.reply("Executed!");
        await m.react("☑️");
        setRuntimeValue("auto_read", true);
      }
    } else if (query === "false" || query === "off") {
      if (autoRead === false) {
        await m.reply("Already inactive!");
        await m.react("🚫");
      } else {
        await m.reply("Executed!!");
        await m.react("☑️");
        setRuntimeValue("auto_read", false);
      }
    } else {
      await m.reply(
        `\`\`\`Wrong! Try Again!\`\`\`\n> Example: ${usedPrefix + command} true`,
      );
      await m.react("❌");
    }
  },
};
