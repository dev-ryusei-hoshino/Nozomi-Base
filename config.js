import packageFile from "./package.json" with { type: "json" };

export default {
  pairingWithQr: false,
  ignore_self: true, // matikan jika perlu saja, karena ini bisa fatal
  markOnlineOnConnect: true,
  auto_read: true,

  bot: {
    name: "Nozomi Base",
    slog: "Pyahyaya~!",
    ver: packageFile.version,
    thumb:
      "https://i.ibb.co.com/0yJCNd0C/b1140d19-b147-4db9-8189-a0df99852a50.jpg",
    vid_thumb:
      "https://cdn.ornzora.eu.cc/7e92c9af-9e11-42f1-803c-8c23ecdb0ffe-upload-1786022115577.mp4",
    prefix: ["!", "."],

    owner: {
      number: "6285198221676",
      name: "Ryusei Hoshino",
    },
  },

  mess: {
    owner: "🚫 Akses ditolak. Fitur ini khusus owner bot.",
    admin:
      "🚫 Akses ditolak. Hanya admin grup yang dapat menggunakan fitur ini.",
    bot_not_admin:
      "⚠️ Bot harus menjadi admin terlebih dahulu untuk menjalankan fitur ini.",
    group: "⚠️ Fitur ini hanya dapat digunakan di dalam grup.",
    private: "⚠️ Fitur ini hanya tersedia di chat pribadi.",
    permium: "🚫 Akses ditolak. Fitur ini khusus pengguna premium.",
    wait: "⏳ Sedang memproses permintaan...",
    plugin_not_available: "❌ *Error:* Plugin tidak tersedia untuk saat ini.",
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
