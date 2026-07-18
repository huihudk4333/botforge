const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channelId = config.welcomeChannelId;
    if (!channelId || channelId.startsWith('PUT_')) return; // not configured yet

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setTitle('👋 Welcome!')
      .setDescription(
        (config.welcomeMessage || 'Welcome {user} to {server}! We hope you enjoy your stay.')
          .replace('{user}', `${member}`)
          .replace('{server}', member.guild.name)
      )
      .setColor(config.panel?.color || '#5865F2')
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `Member #${memberCount}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch((err) => {
      console.error('Failed to send welcome message:', err);
    });
  },
};
