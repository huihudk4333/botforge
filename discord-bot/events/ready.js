module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity('made by forrealrob dm him for a bot like me', { type: 3 }); // 3 = Watching
  },
};
