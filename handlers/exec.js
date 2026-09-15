import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

const TIMEOUT = 60000;
const MAX_TEXT_LENGTH = 60000;

function getShell() {
  switch (process.platform) {
    case "win32":
      return {
        shell: process.env.ComSpec || "cmd.exe",
        platform: "Windows",
      };

    case "darwin":
      return {
        shell: process.env.SHELL || "/bin/zsh",
        platform: "macOS",
      };

    default:
      return {
        shell: process.env.SHELL || "/bin/bash",
        platform: "Linux",
      };
  }
}

async function sendOutput(conn, m, jid, output) {
  const text = output || "Command selesai tanpa output.";

  if (text.length <= MAX_TEXT_LENGTH) {
    return m.reply(`\`\`\`${text}\`\`\``);
  }

  const content = Buffer.from(text, "utf-8");

  return conn.sendMessage(
    jid,
    {
      document: content,
      mimetype: "text/plain",
      fileName: `exec-${Date.now()}.txt`,
    },
    {
      quoted: {
        key: m.key,
        message: m.message,
      },
    },
  );
}

export async function handleExec(conn, m, jid, command) {
  if (!command?.trim()) {
    return m.reply(
      "Penggunaan:\n\n$ <command>\n\nContoh:\n$ node --version\n$ npm install\n$ ls",
    );
  }

  const { shell } = getShell();

  try {
    const { stdout, stderr } = await execAsync(command, {
      shell,
      cwd: process.cwd(),
      timeout: TIMEOUT,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
      env: process.env,
    });

    const output = [stdout, stderr].filter(Boolean).join("\n").trim();

    return sendOutput(conn, m, jid, output || "Command selesai tanpa output.");
  } catch (error) {
    const stdout = error.stdout || "";
    const stderr = error.stderr || "";

    let output = [stdout, stderr].filter(Boolean).join("\n").trim();

    if (error.killed && error.signal) {
      output = ["Process dihentikan karena timeout.", output]
        .filter(Boolean)
        .join("\n");
    }

    if (!output) {
      output = error.message || "Command gagal dijalankan.";
    }

    return sendOutput(conn, m, jid, output);
  }
}
