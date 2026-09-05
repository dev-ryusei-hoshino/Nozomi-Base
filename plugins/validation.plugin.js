export default {
  name: "test",
  category: "test",
  command: "test",
  async run(conn, m, { args, jid, isOwner, isAdmin, isBotAdmin }) {
    m.reply(
      `*isAdmin*\n> ${isAdmin}\n\n*isOwner*\n> ${isOwner}\n\n*isBotAdmin*\n> ${isBotAdmin}`,
    );
  },
};
