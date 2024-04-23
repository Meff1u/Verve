const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { writeFileSync } = require('fs');

const slash = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Use being on the voice channel to start your musical adventure!'),
  cooldown: 30000,
  ownerOnly: false,
  run: async (client, interaction, guildData, lang) => {
    const channel = interaction.member.voice.channel;

    if (channel) {
      await interaction.deferReply();

      try {
        if (useQueue(interaction.guild.id))
          return interaction.editReply({
            content: lang.commands.start.alreadyActive,
            ephemeral: true
          });
        const queue = createQueue(client, interaction, channel, lang);
        if (!queue) return interaction.editReply({ content: lang.common.error });

        await queue.connect(channel);
        await queue.node.setBitrate(channel.bitrate);

        const embedMenu = new EmbedBuilder()
          .setTitle(`Verve - ${lang.commands.start.readyToPlay}`)
          .setColor(client.mainColor)
          .setDescription(lang.commands.start.readyDescription)
          .setFooter({ text: `Host: ${interaction.user.tag}` });

        const menuRow2 = new ActionRowBuilder().addComponents(client.buttons.add, client.buttons.search);

        await interaction.editReply({ embeds: [embedMenu], components: [menuRow2] }).then(async (msg) => {
          guildData.playerChannel = interaction.channel.id;
          guildData.playerMessage = msg.id;
          queue.playerMessage = msg;
          writeFileSync(`./src/datas/guilds/${interaction.guildId}/data.json`, JSON.stringify(guildData, null, 2));
        });
      } catch (e) {
        console.log(e);
        return interaction.editReply({ content: lang.common.error });
      }
    } else {
      await interaction.reply({
        content: lang.commands.start.needToJoinVC,
        ephemeral: true
      });
    }
  }
};

function createQueue(client, interaction, channel, lang) {
  try {
    const createdQueue = client.player?.queues.create(interaction.guildId, {
      ...this.playerOptions,
      leaveOnEnd: false,
      leaveOnEmpty: false,
      leaveOnStop: true,
      maxSize: 200,
      volume: 100,
      metadata: {
        interaction: interaction,
        client: client,
        channel: channel,
        host: interaction.user,
        lang: lang
      }
    });

    return createdQueue;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

module.exports = slash;
