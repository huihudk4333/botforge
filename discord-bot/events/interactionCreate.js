const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { createTicket, claimTicket, closeTicket } = require('../utils/ticketManager');
const { loadGiveaways, saveGiveaways } = require('../utils/giveawayManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      // Dropdown: category selection -> create ticket
      if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category_select') {
        const categoryId = interaction.values[0];
        await createTicket(interaction, categoryId);
        return;
      }

      // Buttons
      if (interaction.isButton()) {
        if (interaction.customId === 'giveaway_join') {
          const giveaways = loadGiveaways();
          const giveaway = giveaways[interaction.message.id];

          if (!giveaway || giveaway.ended) {
            return interaction.reply({ content: 'This giveaway has ended.', ephemeral: true });
          }

          const userId = interaction.user.id;
          const idx = giveaway.entrants.indexOf(userId);

          if (idx === -1) {
            giveaway.entrants.push(userId);
            saveGiveaways(giveaways);
            await interaction.reply({ content: '🎉 You entered the giveaway!', ephemeral: true });
          } else {
            giveaway.entrants.splice(idx, 1);
            saveGiveaways(giveaways);
            await interaction.reply({ content: 'You left the giveaway.', ephemeral: true });
          }
          return;
        }

        if (interaction.customId === 'ticket_claim') {
          await claimTicket(interaction);
          return;
        }

        if (interaction.customId === 'ticket_close') {
          await closeTicket(interaction, null);
          return;
        }

        if (interaction.customId === 'ticket_close_reason') {
          const modal = new ModalBuilder()
            .setCustomId('ticket_close_reason_modal')
            .setTitle('Close Ticket');

          const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason_input')
            .setLabel('Reason for closing')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('e.g. Issue resolved')
            .setRequired(true)
            .setMaxLength(500);

          modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
          await interaction.showModal(modal);
          return;
        }
      }

      // Modal submit: close with reason
      if (interaction.isModalSubmit() && interaction.customId === 'ticket_close_reason_modal') {
        const reason = interaction.fields.getTextInputValue('close_reason_input');
        await closeTicket(interaction, reason);
        return;
      }
    } catch (err) {
      console.error('Error handling interaction:', err);
      const errMsg = { content: 'Something went wrong handling that action.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errMsg).catch(() => {});
      } else {
        await interaction.reply(errMsg).catch(() => {});
      }
    }
  },
};
