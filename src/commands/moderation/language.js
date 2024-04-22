const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { readdirSync } = require('fs');

const slash = {
  data: new SlashCommandBuilder().setName('language').setDescription('Change the display language'),
  cooldown: 20000,
  ownerOnly: false,
  run: async (client, interaction, guildData, lang) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({
        content: `${lang.common.noPermission} (\`Administrator\`)`,
        ephemeral: true
      });

    const langFiles = readdirSync('./src/locale');
    const optionsPromises = langFiles.map(async (langFile) => {
      let l = await require(`../../locale/${langFile}`);
      if (l.title == lang.title) return null;
      let code = langFile.split('.')[0];
      return new StringSelectMenuOptionBuilder().setLabel(l.title).setEmoji(client.codeToFlag(code)).setValue(code);
    });

    const options = (await Promise.all(optionsPromises)).filter((option) => option !== null);
    const select = new StringSelectMenuBuilder()
      .setCustomId('language')
      .setPlaceholder(lang.commands.language.chooseLanguage)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);
    await interaction.reply({ components: [row] });
  }
};

module.exports = slash;
