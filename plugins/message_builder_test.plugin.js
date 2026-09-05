import { delay } from "@whiskeysockets/baileys";

export default {
  name: "Message Builder Test",
  category: ["owner"],
  command: ["messagebuildertest", "mbt"],
  owner_only: true,
  async run(conn, m, { jid, args, isOwner }) {
    if (isOwner) {
      const { VERSION, Button, ButtonV2, Carousel, AIRich, Toolkit } =
        await import("../utils/MessageBuilderV4.7.js");

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
        .addSuggest("MessageBuilderV4.7")
        .addSuggest(["Nixel", "NIXCODE", "Fiora Sylvie", "AIRich"])
        .addTip("Ini adalah text tip (Metadata Text)")
        .addText(
          `
# Halo Dunia
## NIXCODE

---

=={ Yellow Text }==

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

Ini LaTeX:
[Identifier|?Width|?Height|?Font_Height|?Padding] <url>
[Shiroko|1429|1897]<https://cdn.ornzora.eu.cc/5442e78b-fe26-4cb9-939d-e6df83acad6a-FIORA.png>
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

      /**
       * For more example code, check it out here
       * https://gist.githubusercontent.com/ValdazGT/ce6532c1d4ff192bb718f1acb392d460/raw/9683ebc0ac47280c8729680ad074c3cb309d7ab5/MessageBuilderV4.7_Example-Code.js
       **/

      const rich = new AIRich(conn)
        .setTitle("🚀 NIXCODE")
        .setFooter("© Fiora Sylvie");

      rich.addSuggest("MessageBuilderV4.7");

      await rich.send(jid);
      await delay(1500);

      rich.addText(
        "Hey! Welcome to [MessageBuilderV4.7](https://gist.github.com/ValdazGT) 👋",
        { id: "intro" },
      );

      await rich.sendEdit();
      await delay(1800);

      rich.addText(
        "This is a live tour of MessageBuilderV4.7. Everything below will be built directly into this message.",
        { insertAt: "intro", id: "welcome" },
      );
      rich.addSuggest(["MessageBuilderV4.7", "Dynamic AIRich", "NIXCODE"]);

      await rich.sendEdit();
      await delay(1800);

      rich.addText(
        "First, loading states. The item appears first, then gets replaced when the content is ready.",
        { insertAt: "welcome", id: "loading_intro" },
      );

      await rich.sendEdit();
      await delay(1500);

      rich.addImage("", {
        status: "GENERATING",
        update_text: "Generating image...",
        insertAt: "loading_intro",
        id: "image1",
      });

      await rich.sendEdit();
      await delay(3000);

      rich.addImage(
        "https://cdn.ornzora.eu.cc/2a639cd2-5c33-49e3-982f-77f471c9313f-FIORA.jpg",
        { replace: "image1" },
      );

      await rich.sendEdit();
      await delay(2000);

      rich.addText("Video supports the same loading → replace flow.", {
        insertAt: "image1",
        id: "video_intro",
      });

      await rich.sendEdit();
      await delay(1500);

      rich.addVideo("", {
        status: "GENERATING",
        estimatedTime: 3000,
        insertAt: "video_intro",
        id: "video1",
      });

      await rich.sendEdit();
      await delay(4000);

      rich.addVideo(
        "https://cdn.ornzora.eu.cc/3bb12237-2365-4a76-a4e2-635faea6d54c-FIORA.mp4",
        { replace: "video1" },
      );

      await rich.sendEdit();
      await delay(2000);

      rich.addText("Now for code blocks with syntax highlighting.", {
        insertAt: "video1",
        id: "code_intro",
      });

      await rich.sendEdit();
      await delay(1200);

      rich.addCode(
        "javascript",
        `function greet(name) {
	return \`Hello, \${name}!\`
}

greet('Nixel')`,
        { insertAt: "code_intro", id: "code1" },
      );

      await rich.sendEdit();
      await delay(2500);

      rich.addText("Tables are supported too.", {
        insertAt: "code1",
        id: "table_intro",
      });

      await rich.sendEdit();
      await delay(1200);

      rich.addTable(
        [
          ["Name", "Role"],
          ["[Nixel](https://nixel.dev/)", "Developer"],
          ["Fiora Sylvie", "Assistant"],
        ],
        {
          insertAt: "table_intro",
          id: "table1",
        },
      );

      await rich.sendEdit();
      await delay(2500);

      rich.addText(
        "You can also build content in another AIRich instance and reuse its items.",
        { insertAt: "table1", id: "mix_intro" },
      );

      await rich.sendEdit();
      await delay(1800);

      const items = new AIRich(conn)
        .addProduct({
          title: "NIXCODE",
          brand: "Nixel",
          price: "MessageBuilderV4.7",
          product_url: "https://gist.github.com/ValdazGT",
          image_url:
            "https://cdn.ornzora.eu.cc/2a639cd2-5c33-49e3-982f-77f471c9313f-FIORA.jpg",
        })
        .addPost({
          profile:
            "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
          title: "Behind the build",
          username: "nixel.dev",
          verified: true,
          caption: "Built separately, then mixed into another AIRich message.",
          thumbnail:
            "https://cdn.ornzora.eu.cc/69551181-48c0-4466-b22d-235a93db8a63-FIORA.jpg",
          url: "https://nixel.dev/",
          source_app: "INSTAGRAM",
        })
        .addReels({
          profile:
            "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
          username: "nixel.dev",
          thumbnail:
            "https://cdn.ornzora.eu.cc/6b1c1b29-9b80-4cfa-9c57-d008d60e18bc-FIORA.jpg",
          url: "https://nixel.dev/",
          verified: true,
        }).items;

      rich.addText(
        "These cards came from a completely separate AIRich instance.",
        { insertAt: "mix_intro", id: "mix_note" },
      );

      await rich.sendEdit();
      await delay(1500);

      rich.addSection(AIRich.newLayout("HScroll", items), {
        insertAt: "mix_note",
        id: "mixed_items",
      });

      await rich.sendEdit();
      await delay(3000);

      rich.addTip(
        "The Product and Post above were created separately, extracted with .items, then inserted here using .addSection().",
        { insertAt: "mixed_items", id: "mix_explain" },
      );

      await rich.sendEdit();
      await delay(2500);

      rich.addText(
        "You can continue building underneath the mixed section normally.",
        { insertAt: "mix_explain", id: "after_mix" },
      );

      await rich.sendEdit();
      await delay(1800);

      rich.addSource(
        [
          {
            icon: "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
            url: "https://gist.github.com/ValdazGT/",
            title: "MessageBuilderV4.7",
            subtitle: "GitHub Gist · MessageBuilder",
          },
        ],
        {
          insertAt: "after_mix",
          id: "source1",
        },
      );

      await rich.sendEdit();
      await delay(1800);

      rich.addReels(
        [
          {
            profile:
              "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
            username: "nixel.dev",
            thumbnail:
              "https://cdn.ornzora.eu.cc/2a639cd2-5c33-49e3-982f-77f471c9313f-FIORA.jpg",
            url: "https://nixel.dev/",
            verified: true,
          },
          {
            profile:
              "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
            username: "nixel.dev",
            thumbnail:
              "https://cdn.ornzora.eu.cc/69551181-48c0-4466-b22d-235a93db8a63-FIORA.jpg",
            url: "https://nixel.dev/",
            verified: true,
          },
          {
            profile:
              "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
            username: "nixel.dev",
            thumbnail:
              "https://cdn.ornzora.eu.cc/6b1c1b29-9b80-4cfa-9c57-d008d60e18bc-FIORA.jpg",
            url: "https://nixel.dev/",
            verified: true,
          },
          {
            profile:
              "https://cdn.ornzora.eu.cc/bd0d65c6-8a44-4418-8d40-ae0ac00a2386-FIORA.jpg",
            username: "nixel.dev",
            thumbnail:
              "https://cdn.ornzora.eu.cc/6b07d572-8aeb-4bbe-9faa-f226bacd5c99-FIORA.jpg",
            url: "https://nixel.dev/",
            verified: true,
          },
        ],
        {
          insertAt: "source1",
          id: "reels1",
        },
      );

      await rich.sendEdit();
      await delay(2200);

      rich.addWidget(
        {
          title: "Quick Actions",
          sections: [],
          actions: [
            {
              label: "Join Channel",
              kind: "OTHER",
              state: "PENDING",
              id: "channel",
            },
          ],
        },
        {
          insertAt: "reels1",
          id: "widget1",
        },
      );

      await rich.sendEdit();
      await delay(2000);

      rich.addFooterAction(
        {
          text: "Visit Channel",
          url: "https://whatsapp.com/channel/0029VbCV1ck8fewpdNb2TY2k",
        },
        {
          id: "footer1",
        },
      );

      await rich.sendEdit();
      await delay(2500);

      rich.addMetadata(
        "That is the basic workflow: create, insert, replace, mix, and continue building downward in the same editable message.",
        { id: "cleanup_intro", insertAt: "reels1" },
      );

      await rich.sendEdit();
      await delay(3000);

      rich.delete("cleanup_intro");
      await rich.sendEdit();
      await delay(400);

      rich.addText(
        `That's the full MessageBuilderV4.7 tour — built live, edited live, and mixed from separate AIRich instances. 🚀\n\nFor more example code, check it out [here](https://gist.githubusercontent.com/ValdazGT/ce6532c1d4ff192bb718f1acb392d460/raw/9683ebc0ac47280c8729680ad074c3cb309d7ab5/MessageBuilderV4.7_Example-Code.js).`,
        { insertAt: "widget1", id: "final" },
      );

      await rich.sendEdit();

      return;
    }
  },
};
