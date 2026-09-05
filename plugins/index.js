import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plugins = new Map();
const pluginTracker = new Map();

const log = {
  success: chalk.green("OK"),
  error: chalk.red("ERR"),
  info: chalk.blue("INFO"),
};

let error = false;

async function loadPlugin(file) {
  const filePath = path.join(__dirname, file);

  const fileUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;

  try {
    const start = performance.now();
    const module = await import(fileUrl);
    const plugin = module.default;

    if (plugin && plugin.command) {
      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command];

      if (pluginTracker.has(file)) {
        const oldCommands = pluginTracker.get(file);
        oldCommands.forEach((cmd) => plugins.delete(cmd.toLowerCase()));
      }
      commands.forEach((cmd) => {
        plugins.set(cmd.toLowerCase(), plugin);
      });

      pluginTracker.set(file, commands);
      const ms = (performance.now() - start).toFixed(0);
      console.log(
        log.success,
        `Berhasil memuat: ${plugin.name || file} (${ms}ms)`,
      );
    }
  } catch (err) {
    console.error(
      log.error,
      `Gagal memuat ${file}:`,
      chalk.yellow(err.message),
    );
    error = true;
  }
}

export async function loadPlugins() {
  const ObjectFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.endsWith(".plugin.js"));

  await Promise.all(ObjectFiles.map(loadPlugin));

  if (!error) console.clear();
}

const watchTimers = new Map();

function watchPluginsDir() {
  try {
    fs.watch(__dirname, { persistent: false }, (eventType, filename) => {
      if (filename && filename.endsWith(".plugin.js")) {
        if (watchTimers.has(filename)) clearTimeout(watchTimers.get(filename));

        watchTimers.set(
          filename,
          setTimeout(async () => {
            const filePath = path.join(__dirname, filename);

            if (!fs.existsSync(filePath)) {
              if (pluginTracker.has(filename)) {
                const cmds = pluginTracker.get(filename);
                cmds.forEach((cmd) => plugins.delete(cmd.toLowerCase()));
                pluginTracker.delete(filename);
                console.log(
                  log.info,
                  `Plugin dihapus dari memory: ${filename}`,
                );
              }
              return;
            }

            console.log(
              log.info,
              `Perubahan terdeteksi pada ${chalk.yellow(filename)}, memuat ulang...`,
            );
            await loadPlugin(filename);
          }, 100),
        );
      }
    });
  } catch (err) {
    console.warn(chalk.yellow("Gagal memulai file watcher:"), err.message);
  }
}

watchPluginsDir();

export { plugins, pluginTracker };
