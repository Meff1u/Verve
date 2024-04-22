const { SlashCommandBuilder } = require('@discordjs/builders');

const slash = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Returns bot latency'),
  cooldown: 5000,
  ownerOnly: false,
  run: async (client, interaction, guildData, lang) => {
    const ping = await interaction.reply({ content: lang.commands.ping.pinging, fetchReply: true });
    await interaction.editReply(
      `Pong! 🏓\nWS: \`${client.ws.ping}ms\`\nREST: \`${ping.createdTimestamp - interaction.createdTimestamp}ms\``
    );
  }
};

module.exports = slash;
