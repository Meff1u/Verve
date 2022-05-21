const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Lists the songs that are queued.'),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        if (interaction.member.voice.channel !== interaction.guild.me.voice.channel) {
            const embed = new MessageEmbed()
            .setTitle(lang.errors.sameChannel)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        if (!gqueue || gqueue.songs.length === 0) {
            const embed = new MessageEmbed()
            .setTitle(lang.commands.queue.noQueue)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        let qdesc = '';
        let num = gqueue.songs.length;
        if (num > 15) num = 15;
        for (let i = 0; i < num; i++) {
            qdesc += `${i + 1}. **[${gqueue.songs[i].name}](${gqueue.songs[i].url})** (${gqueue.songs[i].requestedBy})\n`;
        }
        const adesc = gqueue.songs.length === num ? '' : `... + ${gqueue.songs.length - num} ${lang.commands.queue.more}`;
        const embed = new MessageEmbed()
        .setTitle(`${lang.commands.queue.title} - ${interaction.guild.name}`)
        .setColor('#AB40AF')
        .setDescription(`${qdesc}${adesc}`);
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('fullqueue')
            .setLabel(lang.commands.queue.button)
            .setStyle('SECONDARY'),
        );
        await interaction.followUp({ embeds: [embed], components: [row] }).then(m => {
            setTimeout(function() {
                m.edit({ components: [] });
            }, 10000);
        });
    },
};