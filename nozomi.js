process.on("warning", (warning) => {
  if (
    warning.name === "DeprecationWarning" &&
    warning.message.includes("punycode")
  ) {
    return;
  }

  console.warn(warning);
});

const originalWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = (chunk, encoding, callback) => {
  const text = chunk?.toString?.() || "";

  if (
    text.includes("Closing session") ||
    text.includes("(node:6008)") ||
    text.includes("(node:8608)") ||
    text.includes("(node:") ||
    text.includes("[DEP0040]") ||
    text.includes("✅") ||
    text.includes("SessionEntry") ||
    text.includes("currentRatchet") ||
    text.includes(
      "(Use `node --trace-deprecation ...` to show where the warning was created)",
    ) ||
    text.includes("pendingPreKey") ||
    text.includes("[LOG] Emoji") ||
    text.includes("EmojiDB loaded") ||
    text.includes("EmojiDB saved")
  ) {
    return true;
  }

  return originalWrite(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
  const text = chunk?.toString?.() || "";

  if (
    text.includes("[DEP0040]") ||
    text.includes("punycode") ||
    text.includes("trace-deprecation")
  ) {
    return true;
  }

  return originalStderrWrite(chunk, encoding, callback);
};

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} from "@whiskeysockets/baileys";
import Pino from "pino";
import readline from "readline";
import fs from "fs/promises";
import chalk from "chalk";
import packageFile from "./package.json" with { type: "json" };
import QRCode from "qrcode-terminal";
import validator from "validator";
import { handleMessage } from "./handlers/message.js";
import { loadPlugins } from "./plugins/index.js";

import config from "./config.js";

const sessionDir = "nozomi_sessions";

function validatePhoneNumber(input) {
  const cleaned = input.replace(/[^0-9]/g, "");
  if (!cleaned) throw new Error("Phone number cannot be empty.");
  if (!validator.isMobilePhone(cleaned, "id-ID"))
    throw new Error("Phone number format not recognized. Use +62 xxx or 08xxx.");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  throw new Error("Phone number format not recognized. Use +62 xxx or 08xxx.");
}

async function checkForUpdates() {
  try {
    console.log("Checking for any updates..");
    const response = await fetch(
      "https://raw.githubusercontent.com/dev-ryusei-hoshino/Nozomi-Base/refs/heads/main/package.json",
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const remotePackage = await response.json();

    const currentVersion = packageFile.version;
    const latestVersion = remotePackage.version;

    if (currentVersion === latestVersion || currentVersion >= latestVersion) {
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
      "Please update Nozomi-Base manually to get the latest improvements and fixes.",
    );
    console.log(
      `  ${chalk.gray("Repository:")} ${chalk.underline(
        "https://github.com/dev-ryusei-hoshino/Nozomi-Base",
      )}`,
    );
  } catch (error) {
    console.error(chalk.red("Failed to check for updates:"), error.message);
  }
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
        `Enter your bot WhatsApp number ${chalk.gray(`(example: 6281234567890)`)}:\n`,
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
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: config.pairingWithQr,
    browser: Browsers.macOS("Safari"),
    logger: Pino({ level: "silent" }),
    markOnlineOnConnect: config.bot.markOnlineOnConnect,
    version,
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
              `How to login: Open WhatsApp > Link Devices > Link with Phone Number > Enter the code above.`,
            ),
          );
        } catch (err) {
          console.error("Failed to request pairing code:", err.message);
          return connectToWhatsApp();
        }
      } else if (config.pairingWithQr) {
        QRCode.generate(qr, { small: true });
        console.log(
          "Scan the QR code above with WhatsApp > Link Devices > Link Devices",
        );
      }
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;

      console.log("Connection lost, trying to reconnect..");

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log(
          `Invalid session. Deleting folder "${chalk.yellow(sessionDir)}" and trying again...`,
        );

        try {
          await fs.rm(sessionDir, { recursive: true, force: true });
        } catch (err) {
          console.error("Failed to delete session folder:", err.message);
        }

        setTimeout(() => connectToWhatsApp(), 3000);
      }
    } else if (connection === "open") {
      console.log(`🎉 ${config.bot.name} successfully connected to WhatsApp!`);
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    await handleMessage(conn, msg);
  });
}

await loadPlugins();
checkForUpdates();
connectToWhatsApp();
