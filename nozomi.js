process.on("warning", (warning) => {
  if (
    warning.name === "DeprecationWarning" &&
    warning.message.includes("punycode")
  ) {
    return;
  }

  console.warn(warning);
});

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

const stdoutFilters = [
  "Closing session",
  "(node:",
  "[DEP0040]",
  "SessionEntry",
  "currentRatchet",
  "pendingPreKey",
  "[LOG] Emoji",
  "EmojiDB loaded",
  "EmojiDB saved",
  "trace-deprecation",
];

const stderrFilters = ["[DEP0040]", "punycode", "trace-deprecation"];

process.stdout.write = (chunk, encoding, callback) => {
  const text = chunk?.toString?.() || "";

  if (stdoutFilters.some((filter) => text.includes(filter))) {
    return true;
  }

  return originalStdoutWrite(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
  const text = chunk?.toString?.() || "";

  if (stderrFilters.some((filter) => text.includes(filter))) {
    return true;
  }

  return originalStderrWrite(chunk, encoding, callback);
};

import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";

import Pino from "pino";
import readline from "readline";
import fs from "fs/promises";
import chalk from "chalk";
import packageFile from "./package.json" with { type: "json" };
import QRCode from "qrcode-terminal";
import validator from "validator";
import config from "./config.js";

import { handleMessage } from "./handlers/message.js";
import { loadPlugins } from "./plugins/index.js";

const sessionDir = config.sessionDir || "nozomi_sessions";

let reconnectTimer = null;
let connecting = false;

function validatePhoneNumber(input) {
  const cleaned = input.replace(/[^0-9]/g, "");

  if (!cleaned) {
    throw new Error("Phone number cannot be empty.");
  }

  if (!validator.isMobilePhone(cleaned, "id-ID")) {
    throw new Error(
      "Phone number format not recognized. Use +62 xxx or 08xxx.",
    );
  }

  if (cleaned.startsWith("0")) {
    return "62" + cleaned.slice(1);
  }

  if (cleaned.startsWith("62")) {
    return cleaned;
  }

  throw new Error("Phone number format not recognized. Use +62 xxx or 08xxx.");
}

async function checkForUpdates() {
  try {
    if (!config.checkForUpdates) return;
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    const response = await fetch(
      "https://raw.githubusercontent.com/dev-ryusei-hoshino/Nozomi-Base/refs/heads/main/package.json",
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return;
    }

    const remotePackage = await response.json();

    const currentVersion = packageFile.version;
    const latestVersion = remotePackage.version;

    if (currentVersion === latestVersion) {
      console.log(
        chalk.green(`You are using the latest version: v${currentVersion}`),
      );
      return;
    }

    console.log(chalk.yellow("A new version of Nozomi-Base is available."));
    console.log(
      `  ${chalk.gray("Current version:")} ${chalk.red(`v${currentVersion}`)}`,
    );
    console.log(
      `  ${chalk.gray("Latest version:")}  ${chalk.green(`v${latestVersion}`)}`,
    );
    console.log(
      `  ${chalk.gray("Repository:")} ${chalk.underline(
        "https://github.com/dev-ryusei-hoshino/Nozomi-Base",
      )}`,
    );
  } catch {}
}

async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const phoneNumberInput = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Time's up. Please try again."));
      }, 120000);

      rl.question(
        `Enter your bot WhatsApp number ${chalk.gray(
          "(example: 6281234567890)",
        )}:\n`,
        (answer) => {
          clearTimeout(timeout);
          resolve(answer);
        },
      );
    });

    return validatePhoneNumber(phoneNumberInput);
  } finally {
    rl.close();
  }
}

async function connectToWhatsApp() {
  if (connecting) {
    return;
  }

  connecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: config.pairingWithQr,
      browser: Browsers.macOS("Safari"),
      logger: Pino({ level: "silent" }),
      markOnlineOnConnect: config.bot.markOnlineOnConnect,
      syncFullHistory: config.syncFullHistory,
    });

    let pairingRequested = false;

    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !conn.authState.creds.registered) {
        if (!config.pairingWithQr && !pairingRequested) {
          pairingRequested = true;

          try {
            const phoneNumber = await askPhoneNumber();
            const code = await conn.requestPairingCode(phoneNumber);

            console.log(`YOUR PAIRING CODE: ${chalk.yellow(code)}`);

            console.log(
              chalk.gray(
                "Open WhatsApp > Link Devices > Link with Phone Number > Enter the code above.",
              ),
            );
          } catch (error) {
            console.error("Failed to request pairing code:", error.message);
          }
        }

        if (config.pairingWithQr) {
          QRCode.generate(qr, { small: true });

          console.log(
            "Scan the QR code above with WhatsApp > Link Devices > Link Devices",
          );
        }
      }

      if (connection === "open") {
        connecting = false;

        console.log(
          `${chalk.green("Connected")} ${config.bot.name} successfully connected to WhatsApp!`,
        );

        return;
      }

      if (connection === "close") {
        connecting = false;

        const statusCode = lastDisconnect?.error?.output?.statusCode;

        const shouldReconnect = statusCode !== 401;

        if (!shouldReconnect) {
          console.log(
            `Invalid session. Deleting folder "${chalk.yellow(sessionDir)}"...`,
          );

          try {
            await fs.rm(sessionDir, {
              recursive: true,
              force: true,
            });
          } catch (error) {
            console.error("Failed to delete session folder:", error.message);
          }
        }

        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connectToWhatsApp();
        }, 3000);
      }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async ({ messages }) => {
      for (const msg of messages) {
        try {
          await handleMessage(conn, msg);
        } catch (error) {
          console.error("Message handler error:", error);
        }
      }
    });
  } catch (error) {
    connecting = false;

    console.error("WhatsApp connection error:", error);

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectToWhatsApp();
    }, 3000);
  }
}

async function start() {
  console.log(chalk.cyan(`Starting ${config.bot.name}...`));

  const pluginPromise = loadPlugins();

  connectToWhatsApp();

  pluginPromise
    .then(() => {
      console.log(chalk.green("Plugins loaded successfully."));
    })
    .catch((error) => {
      console.error(chalk.red("Failed to load plugins:"), error);
    });
}

checkForUpdates();
start();
