import util from "util";
import config from "../config.js";
import {
  VERSION,
  Button,
  ButtonV2,
  Carousel,
  AIRich,
  Toolkit,
} from "../utils/MessageBuilderV4.7.js";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export async function handleEval(
  conn,
  m,
  body,
  jid,
  senderJid,
  senderLid,
  senderName,
  command,
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
) {
  if (!isOwner) return;

  const isAsync = body.startsWith("=>");
  const prefixLength = isAsync ? 2 : 1;
  const code = body.slice(prefixLength).trim();

  if (!code) {
    return m.reply(
      "Penggunaan:\n\n> code\n=> code\n\nContoh:\n> 1 + 1\n=> console.log(isOwner)",
    );
  }

  const logs = [];

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const capture = (...args) => {
    logs.push(
      args
        .map((arg) =>
          typeof arg === "string"
            ? arg
            : util.inspect(arg, {
                depth: null,
                maxArrayLength: null,
                maxStringLength: null,
              }),
        )
        .join(" "),
    );
  };

  try {
    console.log = capture;
    console.error = capture;
    console.warn = capture;
    console.info = capture;

    let result;

    if (isAsync) {
      const fn = new AsyncFunction(
        "conn",
        "m",
        "jid",
        "senderJid",
        "senderLid",
        "senderName",
        "command",
        "formattedLid",
        "senderNumber",
        "args",
        "usedPrefix",
        "isOwner",
        "isAdmin",
        "isBotAdmin",
        "isGroup",
        "isPrivate",
        "isBroadcast",
        "isChannel",
        code,
      );

      result = await fn(
        conn,
        m,
        jid,
        senderJid,
        senderLid,
        senderName,
        command,
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
      );
    } else {
      result = eval(code);
    }

    let output = "";

    if (logs.length > 0) {
      output += logs.join("\n");
    }

    if (result !== undefined) {
      const inspected = util.inspect(result, {
        depth: null,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: Infinity,
        compact: false,
      });

      if (output) {
        output += `\n${inspected}`;
      } else {
        output = inspected;
      }
    }

    if (!output) {
      output = "undefined";
    }

    return m.reply(`\`\`\`${output}\`\`\``);
  } catch (error) {
    const output = util.inspect(error, {
      depth: null,
      maxArrayLength: null,
      maxStringLength: null,
      breakLength: Infinity,
      compact: false,
    });

    return m.reply(`\`\`\`${output}\`\`\``);
  } finally {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}
