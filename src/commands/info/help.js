const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const slash = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Commands, informations and tutorials'),
  cooldown: 20000,
  ownerOnly: false,
  run: async (client, interaction, guildData, lang) => {
    const commandsEmbed = new EmbedBuilder()
      .setTitle(`Verve - ${lang.commands.help.commandsTitle}`)
      .setColor(client.mainColor)
      .setThumbnail(client.user.avatarURL())
      .setFooter({ text: `v${client.package.version}`, iconURL: client.user.avatarURL() })
      .setDescription(
        client.commands
          .map(
            (cmd) =>
              `</${cmd.data.name}:${cmd.id}> - ${lang.commands[cmd.data.name].detailedDescription}`
          )
          .join('\n')
      );

    const button = new ButtonBuilder()
      .setCustomId('helpButtonsInfo')
      .setStyle(ButtonStyle.Success)
      .setLabel(lang.commands.help.buttonTitle);
    const aboutbutton = new ButtonBuilder()
      .setCustomId('aboutInfo')
      .setStyle(ButtonStyle.Success)
      .setLabel(lang.commands.help.aboutTitle);

    const row = new ActionRowBuilder().addComponents(button, aboutbutton);

    await interaction.reply({ embeds: [commandsEmbed], components: [row] });
  }
};

module.exports = slash;
