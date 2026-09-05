import chalk from "chalk";
import config from "../config.js";
import { AIRich } from "../utils/MessageBuilderV4.7.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const quotedTests = [
  {
    name: "Conversation",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "TEXT123",
      },
      message: {
        conversation: "Hello World",
      },
    },
  },
  {
    name: "Extended Text",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "EXT123",
      },
      message: {
        extendedTextMessage: {
          text: "Hello World",
        },
      },
    },
  },
  {
    name: "Location",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "LOC123",
      },
      message: {
        locationMessage: {
          degreesLatitude: -6.2,
          degreesLongitude: 106.816666,
          name: config.bot.name,
          address: "Jakarta, Indonesia",
        },
      },
    },
  },
  {
    name: "Contact",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "CONTACT123",
      },
      message: {
        contactMessage: {
          displayName: config.bot.name,
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.bot.name}
TEL;type=CELL:+628123456789
END:VCARD`,
        },
      },
    },
  },
  {
    name: "Contacts Array",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "CONTACTS123",
      },
      message: {
        contactsArrayMessage: {
          contacts: [
            {
              displayName: config.bot.name,
              vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.bot.name}
TEL;type=CELL:+628123456789
END:VCARD`,
            },
          ],
        },
      },
    },
  },
  {
    name: "Image",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "IMAGE123",
      },
      message: {
        imageMessage: {
          mimetype: "image/jpeg",
          caption: "Test Image",
          jpegThumbnail: Buffer.alloc(0),
        },
      },
    },
  },
  {
    name: "Video",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "VIDEO123",
      },
      message: {
        videoMessage: {
          mimetype: "video/mp4",
          seconds: 5,
          jpegThumbnail: Buffer.alloc(0),
        },
      },
    },
  },
  {
    name: "Audio",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "AUDIO123",
      },
      message: {
        audioMessage: {
          mimetype: "audio/ogg; codecs=opus",
          seconds: 5,
          ptt: true,
        },
      },
    },
  },
  {
    name: "Document",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "DOC123",
      },
      message: {
        documentMessage: {
          fileName: "example.pdf",
          mimetype: "application/pdf",
          fileLength: "1024",
        },
      },
    },
  },
  {
    name: "Sticker",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "STICKER123",
      },
      message: {
        stickerMessage: {
          mimetype: "image/webp",
        },
      },
    },
  },
  {
    name: "Live Location",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "LIVE123",
      },
      message: {
        liveLocationMessage: {
          degreesLatitude: -6.2,
          degreesLongitude: 106.816666,
          accuracyInMeters: 10,
          sequenceNumber: 1,
        },
      },
    },
  },
  {
    name: "Poll",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "POLL123",
      },
      message: {
        pollCreationMessage: {
          name: "Favorite Color?",
          options: [{ optionName: "Red" }, { optionName: "Blue" }],
        },
      },
    },
  },
  {
    name: "Reaction",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "REACTION123",
      },
      message: {
        reactionMessage: {
          text: "👍",
        },
      },
    },
  },
  {
    name: "Product",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "PRODUCT123",
      },
      message: {
        productMessage: {},
      },
    },
  },
  {
    name: "Order",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "ORDER123",
      },
      message: {
        orderMessage: {
          orderTitle: "Order",
          itemCount: 1,
          status: 1,
        },
      },
    },
  },
  {
    name: "List",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "LIST123",
      },
      message: {
        listMessage: {
          title: "Menu",
          description: "Testing",
          buttonText: "Open",
        },
      },
    },
  },
  {
    name: "Buttons",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "BUTTON123",
      },
      message: {
        buttonsMessage: {
          contentText: "Hello",
          footerText: "Footer",
        },
      },
    },
  },
  {
    name: "View Once",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "VO123",
      },
      message: {
        viewOnceMessage: {
          message: {
            imageMessage: {
              mimetype: "image/jpeg",
              jpegThumbnail: Buffer.alloc(0),
            },
          },
        },
      },
    },
  },
  {
    name: "Ephemeral",
    quoted: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        id: "EPH123",
      },
      message: {
        ephemeralMessage: {
          message: {
            conversation: "Hello",
          },
        },
      },
    },
  },
];

export default {
  name: "Quoted Tester",
  command: ["testquoted"],
  owner_only: true,
  private_only: false,
  group_only: false,
  description: "Tes semua quoted message",
  category: "owner",

  async run(conn, m, { jid }) {
    try {
      await m.reply(
        `Memulai ${quotedTests.length} pengujian quoted...\nJeda 5 detik setiap pesan.`,
      );

      for (const test of quotedTests) {
        try {
          await new AIRich(conn)
            .addText(`Testing Quoted\n\n${test.name}`)
            .send(jid, {
              quoted: test.quoted,
            });

          console.log(chalk.green(`✓ ${test.name}`));
        } catch (e) {
          console.log(chalk.red(`✗ ${test.name}`), e);
        }

        await delay(5000);
      }

      await m.reply("Selesai.");
    } catch (e) {
      console.error(e);
      await m.reply("Terjadi kesalahan.");
    }
  },
};
