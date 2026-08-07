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
import QRCode from "qrcode-terminal";
import validator from "validator";
import { handleMessage } from "./handlers/message.js";
import { loadPlugins } from "./plugins/index.js";

import config from "./config.js";

const sessionDir = "nozomi_sessions";

function validatePhoneNumber(input) {
  const cleaned = input.replace(/[^0-9]/g, "");
  if (!cleaned) throw new Error("Nomor tidak boleh kosong.");
  if (!validator.isMobilePhone(cleaned, "id-ID"))
    throw new Error("Format nomor tidak dikenali. Gunakan +62 xxx atau 08xxx.");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  throw new Error("Format nomor tidak dikenali. Gunakan +62 xxx atau 08xxx.");
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
        reject(new Error("Waktu habis. Silakan coba lagi."));
      }, 120000);

      rl.question(
        `Masukkan nomor WhatsApp bot kamu ${chalk.gray(`(contoh: 6281234567890)`)}:\n`,
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

          console.log(`KODE PAIRING KAMU: ${chalk.yellow(code)}`);
          console.log(
            chalk.gray(
              `Cara login: Buka WhatsApp > Tautkan Perangkat > Tautkan dengan Nomor Telepon > Masukkan kode di atas.`,
            ),
          );
        } catch (err) {
          console.error("Gagal meminta kode pairing:", err.message);
          return connectToWhatsApp();
        }
      } else if (config.pairingWithQr) {
        QRCode.generate(qr, { small: true });
        console.log(
          "Scan QR code di atas dengan WhatsApp > Tautkan Perangkat > Tautkan Perangkat",
        );
      }
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;

      console.log("Koneksi terputus, mencoba menghubungkan ulang..");

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log(
          `Sesi tidak valid. Menghapus folder "${chalk.yellow(sessionDir)}" dan mencoba lagi...`,
        );

        try {
          await fs.rm(sessionDir, { recursive: true, force: true });
        } catch (err) {
          console.error("Gagal menghapus folder sesi:", err.message);
        }

        setTimeout(() => connectToWhatsApp(), 3000);
      }
    } else if (connection === "open") {
      console.log("🎉 Nozomi Bot berhasil tersambung ke WhatsApp!");
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    await handleMessage(conn, msg);
  });
}

await loadPlugins();
connectToWhatsApp();
