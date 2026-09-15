import chokidar from "chokidar";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import chalk from "chalk";

const registeredFiles = new Set();
let watcher = null;

export function registerAutoReload(importMetaUrl) {
  const filePath = fileURLToPath(importMetaUrl);

  registeredFiles.add(filePath);

  if (!watcher) {
    watcher = chokidar.watch([...registeredFiles], {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    watcher.on("change", async (changedPath) => {
      try {
        const url = `${pathToFileURL(changedPath).href}?reload=${Date.now()}`;

        await import(url);

        console.log(
          chalk.cyanBright("[HOSHINO WATCHER]"),
          `Reloaded: ${chalk.yellow(path.relative(process.cwd(), changedPath))}`,
        );
      } catch (error) {
        console.error(
          chalk.red(
            `[HOSHINO WATCHER] Failed: ${path.relative(process.cwd(), changedPath)}`,
          ),
        );
        console.error(error);
      }
    });
  }

  return filePath;
}
