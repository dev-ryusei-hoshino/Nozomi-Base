import fs from "fs";

const runtimePath = "./database/runtime.json";

export function getRuntime() {
  return JSON.parse(fs.readFileSync(runtimePath, "utf8"));
}

export function getRuntimeValue(key) {
  const runtime = getRuntime();
  return runtime[key];
}

export function setRuntimeValue(key, value) {
  const runtime = getRuntime();

  runtime[key] = value;

  fs.writeFileSync(runtimePath, JSON.stringify(runtime, null, 2));

  return value;
}

export function modifyRuntime(key, callback) {
  const runtime = getRuntime();

  runtime[key] = callback(runtime[key]);

  fs.writeFileSync(runtimePath, JSON.stringify(runtime, null, 2));

  return runtime[key];
}

export function deleteRuntimeValue(key) {
  const runtime = getRuntime();

  delete runtime[key];

  fs.writeFileSync(runtimePath, JSON.stringify(runtime, null, 2));
}

export function hasRuntime(key) {
  const runtime = getRuntime();

  return Object.hasOwn(runtime, key);
}
