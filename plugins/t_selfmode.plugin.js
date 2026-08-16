import fs from "fs";
import { getRuntimeValue, setRuntimeValue } from "../utils/runtime.js";

export default {
  name: "Toggle Self",
  command: ["self"],
  category: "owner",
  owner_only: true,
  async run(conn, m, { jid, args, command, usedPrefix }) {
    const query = args[0]?.toLowerCase();

    const isSelf = getRuntimeValue("self");

    if (query === "true" || query === "on") {
      if (isSelf === true) {
        await m.reply("Already activated!");
        await m.react("🚫");
      } else {
        await m.reply("Executed!");
        await m.react("☑️");
        setRuntimeValue("self", true);
      }
    } else if (query === "false" || query === "off") {
      if (isSelf === false) {
        await m.reply("Already inactive!");
        await m.react("🚫");
      } else {
        await m.reply("Executed!!");
        await m.react("☑️");
        setRuntimeValue("self", false);
      }
    } else {
      await m.reply(
        `\`\`\`Wrong! Try Again!\`\`\`\n> Example: ${usedPrefix + command} true`,
      );
      await m.react("❌");
    }
  },
};
