import packageFile from "./package.json" with { type: "json" };

export default {
  pairingWithQr: false,
  ignore_self: false,
  markOnlineOnConnect: true,
  sessionDir: "nozomi_session",
  syncFullHistory: false,
  checkForUpdates: false,

  bot: {
    name: "Nozomi Base",
    slog: "Pyahyaya~!",
    ver: packageFile.version,
    thumb:
      "https://i.ibb.co.com/0yJCNd0C/b1140d19-b147-4db9-8189-a0df99852a50.jpg",
    vid_thumb:
      "https://cdn.ornzora.eu.cc/7e92c9af-9e11-42f1-803c-8c23ecdb0ffe-upload-1786022115577.mp4",
    prefix: ["!", "$"],

    owner: {
      number: "6283892508772",
      name: "Ryusei Hoshino",
    },
  },
  mess: {
    owner: "🚫 Access denied! You're not the owner!",
    admin: "🚫 Access denied! You're not an admin of this group!",
    bot_not_admin:
      "⚠️ This number needs to be an admin of this group to use this feature.",
    group: "⚠️ Wrong place! This feature is only available in groups.",
    private: "⚠️ Wrong place! Please don't use this feature here.",
    premium:
      "🚫 Nuh uh! You're not a premium user. Contact the owner to get premium access.",
    wait: "⏳ Hold up...",
    plugin_not_available:
      "❌ *Error:* This plugin isn't available right now. Please try again later.",
  },
};

/*
|--------------------------------------------------------------------------
| Credits
|--------------------------------------------------------------------------
|
| Nozomi Base
| Developed by Ryusei Hoshino
|
| Thank you for using Nozomi Base!
| Terima kasih telah menggunakan Nozomi Base!
|
| This project may include third-party libraries, assets, media,
| icons, fonts, and other resources that belong to their respective
| authors and owners.
|
| Project ini mungkin menggunakan library, aset, media, ikon,
| font, maupun sumber daya pihak ketiga yang sepenuhnya merupakan
| milik pembuat dan pemiliknya masing-masing.
|
| We sincerely appreciate every developer, artist, designer,
| maintainer, and contributor whose work made this project possible.
|
| Kami mengucapkan terima kasih kepada seluruh developer, artist,
| designer, maintainer, dan kontributor open source yang telah
| membuat project ini menjadi mungkin.
|
|--------------------------------------------------------------------------
| Links
|--------------------------------------------------------------------------
|
| Repository  :
| https://github.com/dev-ryusei-hoshino/Nozomi-Base
|
| WhatsApp Channel :
| https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N
|
| Contact :
| https://wa.me/6285198221676
|
|--------------------------------------------------------------------------
| Acknowledgements
|--------------------------------------------------------------------------
|
| • Node.js
| • Baileys
| • All Open Source Maintainers
| • Asset creators whose work is used in this project
| • Everyone who has supported Nozomi Base
|
|--------------------------------------------------------------------------
| Note
|--------------------------------------------------------------------------
|
| If you are the author of an asset used in this project and would
| like to be credited, updated, or removed, please open an issue or
| Contant Me.
|
| Jika Anda adalah pembuat aset yang digunakan dalam project ini dan
| ingin dicantumkan, diperbarui, atau dihapus kreditnya, silakan
| Hubungi saya.
|-------------------------------------------------------------------------- */
