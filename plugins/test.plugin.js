import config from "../config.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} from "@whiskeysockets/baileys";

export default {
  name: "Test Command",
  command: ["test"],
  owner_only: true,
  private_only: false,
  group_only: false,
  description: "Tes",
  category: "main",

  async run(conn, m, { jid }) {
    const image = await prepareWAMessageMedia(
      {
        image: {
          url: config.bot.thumb,
        },
      },
      {
        upload: conn.waUploadToServer,
      },
    );

    const video = await prepareWAMessageMedia(
      {
        video: {
          url: config.bot.vid_thumb,
        },
      },
      {
        upload: conn.waUploadToServer,
      },
    );

    const msg = generateWAMessageFromContent(
      jid,
      {
        imageMessage: {
          ...image.imageMessage,
          contextInfo: {
            pairedMediaType: 5,
            statusSourceType: 0,
          },
        },
      },
      {},
    );

    await conn.relayMessage(jid, msg.message, {
      messageId: msg.key.id,
    });

    await conn.relayMessage(
      jid,
      {
        videoMessage: {
          ...video.videoMessage,
          contextInfo: {
            pairedMediaType: 6,
            statusSourceType: 0,
          },
        },
        messageContextInfo: {
          messageAssociation: {
            associationType: 12,
            parentMessageKey: msg.key,
          },
        },
      },
      {},
    );
  },
};
