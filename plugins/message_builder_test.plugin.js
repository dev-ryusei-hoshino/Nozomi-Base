import config from "../config.js";

export default {
  name: "Message Builder Test",
  category: ["owner"],
  command: ["messagebuildertest", "mbt"],
  owner_only: true,
  async run(conn, m, { jid, args, isOwner }) {
    if (isOwner) {
      const { VERSION, Button, ButtonV2, Carousel, AIRich, Toolkit } =
        await import("../utils/MessageBuilderV4.6.js");

      await new Button(conn)
        .setTitle("🚀 NIXCODE")
        .setSubtitle("Interactive Message")
        .setBody("Pilih menu di bawah")
        .setFooter("© Nixel")
        .setImage(
          "https://cdn.ornzora.eu.cc/b57c0d1e-d7a6-4277-8739-8f6b1d9894e6-FIORA.jpg",
        )
        .addReply("📦 Menu", ".menu", { icon: "DEFAULT" }) //change icon
        .addReply("👤 Profile", ".profile", { icon: "REVIEW" })
        .addUrl("🌐 Website", "https://example.com", true, {
          icon: "PROMOTION",
        })
        .addCopy("📋 Copy Code", "NIX-2026", { icon: "DOCUMENT" })
        .addSelection("📚 Pilih Kategori")
        .makeSection("Main Menu") //now .makeSection instead .makeSections
        .makeRow("🔥 HOT", "Downloader", "Download social media", ".dl")
        .makeRow("⚡ FAST", "AI Chat", "Chat dengan AI", ".ai")
        .send(jid, { quoted: m });

      await new ButtonV2(conn)
        .setTitle("🚀 NIXCODE")
        .setSubtitle("Buttons Message")
        .setBody("Halo dunia")
        .setFooter("Footer Message")
        .setThumbnail(
          "https://cdn.ornzora.eu.cc/4d2905ce-3707-4ec0-998a-68a3d851629f-FIORA.jpg",
        )
        .addRawButton({
          buttonText: { displayText: "📡 Menu" },
          buttonId: "Nixel",
          type: 1,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson:
              '{"title":"Click Here!","sections":[{"title":"Fiora Sylvie","highlight_label":"","rows":[{"header":"","title":"Nixel","description":"","id":""}]}]}',
          },
        }) //raw button
        .addButton("👤 Profile", ".profile")
        .send(jid);

      await new Carousel(conn)
        .setBody("🛍️ Product List")
        .setFooter("Swipe untuk lihat")
        .addCard(
          await new Button(conn)
            .setTitle("🍔 Burger")
            .setBody("Burger terenak")
            .setFooter("$5")
            .setImage(
              "https://cdn.ornzora.eu.cc/36df8c36-c74e-4dc2-bc03-87893f373cb4-FIORA.jpg",
            )
            .addReply("🛒 Buy", ".buy burger")
            .toCard(),
        )
        .addCard(
          await new Button(conn)
            .setTitle("🍕 Pizza")
            .setBody("Pizza mozzarella")
            .setFooter("$7")
            .setImage(
              "https://cdn.ornzora.eu.cc/36df8c36-c74e-4dc2-bc03-87893f373cb4-FIORA.jpg",
            )
            .addReply("🛒 Buy", ".buy pizza")
            .toCard(),
        )
        .send(jid, { quoted: m });

      await new AIRich(conn)
        .setTitle("🚀 NIXCODE")
        .setFooter("© Fiora Sylvie")
        .addSuggest("MessageBuilderV4.6")
        .addSuggest(["Nixel", "NIXCODE", "Fiora Sylvie", "AIRich"])
        .addTip("Ini adalah text tip (Metadata Text)")
        .addText(
          `
# Halo Dunia
## NIXCODE

---

=={ Yellow Text }==

*Bold*
**Bolder**
***SUPER BOLD***

---

Ini hyperlink:
[Text] (url) 
## TRUSTED LINK
[Google](https://google.com)
## UNTRUSTED LINK
[Google](!https://google.com)

Ini auto citation:
[] (url) 
[](https://openai.com)
`,
        )
        .addText("SingleLayout Product (Object Input):")
        .addProduct({
          title: "Fiora Sylvie",
          brand: "Nixel",
          price: "Rp 1000",
          sale_price: "Rp 0",
          url: "https://wa.me/6285188349341",
          image:
            "https://cdn.ornzora.eu.cc/152f4f0b-02fb-4d60-aacc-fc4cfa87ccdb-FIORA.jpg", //buffer or base64 supported
        })
        .addText("HScroll Product (Array of Object Input):")
        .addProduct(
          Array(5).fill({
            title: "Fiora Sylvie",
            brand: "Nixel",
            price: "Rp 1000",
            sale_price: "Rp 0",
            url: "https://wa.me/6285188349341",
            image:
              "https://cdn.ornzora.eu.cc/152f4f0b-02fb-4d60-aacc-fc4cfa87ccdb-FIORA.jpg", //buffer or base64 supported
          }),
        )
        .addCode(
          "javascript",
          `class Nixel {
	static hello() {
		return 'Hello World';
	}
}`,
        )
        .addTable([
          ["Nama", "Role"],
          ["[Nixel](https://wa.me/6285188349341)", "Developer"], //hyperlink, citation, latex supported
          ["Fiora Sylvie", "Assistant"],
        ])
        .addSource([
          [
            "https://cdn.ornzora.eu.cc/dc85c945-96f7-4d50-aaa4-1dff7249aaf4-FIORA.jpg", //buffer or base64 supported
            "https://github.com/ValdazGT/",
            "GitHub",
          ],
          [
            "https://cdn.ornzora.eu.cc/dc85c945-96f7-4d50-aaa4-1dff7249aaf4-FIORA.jpg", //buffer or base64 supported
            "https://fiora.nixel.my.id/",
            "Fiora Sylvie",
          ],
        ])
        .addImage(
          "https://cdn.ornzora.eu.cc/d987ff9c-c16c-4f1e-a8d6-953e375f4aec-FIORA.jpg",
        ) //buffer or base64 supported
        .addVideo(
          "https://cdn.ornzora.eu.cc/5c3e1109-38d3-408e-926c-588694fd9581-FIORA.mp4",
        ) //buffer or base64 supported
        .addVideo({
          url: "https://cdn.ornzora.eu.cc/5c3e1109-38d3-408e-926c-588694fd9581-FIORA.mp4",
          file_length: 100000000,
          duration: 120,
          thumbnail:
            "https://cdn.ornzora.eu.cc/0800269d-8f1e-4c7e-b38e-8684db560345-FIORA.jpg",
        }) //buffer or base64 supported
        .addReels(
          Array(5).fill({
            username: "Nixel",
            profile:
              "https://cdn.ornzora.eu.cc/4d2905ce-3707-4ec0-998a-68a3d851629f-FIORA.jpg", //buffer or base64 supported
            thumbnail:
              "https://cdn.ornzora.eu.cc/0800269d-8f1e-4c7e-b38e-8684db560345-FIORA.jpg", //buffer or base64 supported
            url: "https://fiora.nixel.my.id/",
            title: "Demo Reel",
            source: "IG",
            verified: true,
          }),
        )
        .addPost(
          Array(5).fill({
            profile:
              "https://cdn.ornzora.eu.cc/2498bf66-6870-4f8a-8421-0a77f7baa95b-FIORA.jpg", //buffer or base64 supported
            username: "Nixel",
            title: "Demo Post",
            subtitle: "NIXCODE",
            caption:
              "hii~ im fiora sylvie, just quietly observing things around here.",
            verified: true,
            url: "https://fiora.nixel.my.id/",
            thumbnail:
              "https://cdn.ornzora.eu.cc/7048efb4-2abf-4081-bdd1-2f65972d793a-FIORA.jpg", //buffer or base64 supported
            source: "INSTAGRAM", // or INSTAGRAM, FACEBOOK, THREADS, NIXEL
            footer: "Fiora Sylvie",
            deeplink: "https://fiora.nixel.my.id/",
            icon: "https://cdn.ornzora.eu.cc/2498bf66-6870-4f8a-8421-0a77f7baa95b-FIORA.jpg", //buffer or base64 supported
          }),
        )
        .send(jid, { quoted: m });
      return;
    }

    m.reply("Harap Masukkan versi");
  },
};
