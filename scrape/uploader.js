import axios from "axios";
import fetch from "node-fetch";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";

export async function uploadLitterbox(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const ext = ft?.ext || "bin";
  const form = new FormData();
  form.append("fileToUpload", buffer, `${fileName}.${ext}`);
  form.append("reqtype", "fileupload");
  form.append("time", "72h");
  const res = await fetch(
    "https://litterbox.catbox.moe/resources/internals/api.php",
    {
      method: "POST",
      body: form,
      timeout: 30000,
    },
  );
  const text = await res.text();
  if (text.startsWith("https://")) return text.trim();
  throw new Error(text || "Litterbox gagal");
}
export async function uploadGofile(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const ext = ft?.ext || "bin";
  const srvRes = await fetch("https://api.gofile.io/servers", {
    timeout: 10000,
  });
  const srvData = await srvRes.json();
  if (!srvData?.data?.servers?.[0]?.name)
    throw new Error("Gofile server gagal");
  const server = srvData.data.servers[0].name;
  const form = new FormData();
  form.append("file", buffer, `${fileName}.${ext}`);
  const res = await fetch(`https://${server}.gofile.io/uploadFile`, {
    method: "POST",
    body: form,
    timeout: 60000,
  });
  const data = await res.json();
  if (!data?.data?.downloadPage) throw new Error("Gofile upload gagal");
  return data.data.downloadPage;
}
export async function uploadQuax(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const ext = ft?.ext || "bin";
  const form = new FormData();
  form.append("file", buffer, `${fileName}.${ext}`);
  const res = await fetch("https://qu.ax/upload.php", {
    method: "POST",
    body: form,
    timeout: 60000,
  });
  const data = await res.json();
  if (!data?.success || !data?.files?.[0]?.url) throw new Error("Qu.ax gagal");
  return data.files[0].url;
}
export async function uploadTmpFiles(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const ext = ft?.ext || "bin";
  const form = new FormData();
  form.append("file", buffer, `${fileName}.${ext}`);
  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
    timeout: 30000,
  });
  const data = await res.json();
  if (data.status === "success" && data.data?.url) {
    const parts = data.data.url.split("/");
    return `https://tmpfiles.org/dl/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
  throw new Error("TmpFiles gagal");
}
export async function uploadPutIcu(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const res = await fetch("https://put.icu/upload/", {
    method: "PUT",
    body: buffer,
    headers: {
      Accept: "application/json",
      "Content-Type": ft?.mime || "application/octet-stream",
    },
    timeout: 60000,
  });
  if (!res.ok) throw new Error("Put.icu gagal");
  const data = await res.json();
  if (data?.direct_url) return data.direct_url;
  if (data?.url) return data.url;
  throw new Error("Put.icu: Invalid response");
}
export async function uploadOrnzora(buffer, fileName) {
  const ft = await fileTypeFromBuffer(buffer);
  const ext = ft?.ext || "bin";
  const mime = ft?.mime || "application/octet-stream";
  const form = new FormData();
  form.append("file", buffer, {
    filename: `${fileName}.${ext}`,
    contentType: mime,
  });
  const res = await axios.post("https://cdn.ornzora.eu.cc/upload", form, {
    headers: { ...form.getHeaders() },
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  const data = res.data;
  const url =
    data?.url ||
    data?.data?.url ||
    data?.link ||
    data?.data?.link ||
    (typeof data === "string" && data.startsWith("https://")
      ? data.trim()
      : null);
  if (!url) throw new Error("Ornzora tidak mengembalikan URL");
  return url;
}
