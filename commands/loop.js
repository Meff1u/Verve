const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Changes the loop mode.')
        .addIntegerOption(option => option
            .setName('mode')
            .setDescription('Select a loop mode for the queue.')
            .setRequired(true)
            .addChoice('SONG', 1)
            .addChoice('QUEUE', 2)
            .addChoice('OFF', 0)),
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
            .setTitle(lang.commands.queue .noQueue)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        const loopmode = interaction.options.getInteger('mode');
        try {
            await gqueue.setRepeatMode(loopmode);
            const embed = new MessageEmbed()
            .setColor('#AB40AF');
            if (loopmode === 1) {
                embed.setTitle(`🔂 ${lang.commands.loop.modeSONG}`);
                embed.setDescription(`([${gqueue.songs[0].name}](${gqueue.songs[0].url}))`);
            }
            else if (loopmode === 2) {
                embed.setTitle(`🔁 ${lang.commands.loop.modeQUEUE}`);
            }
            else if (loopmode === 0) {
                embed.setTitle(`⏩ ${lang.commands.loop.modeOFF}`);
            }
            return await interaction.followUp({ embeds: [embed] });
        }
        catch (e) {
                console.error(e);
                let id = '';
                for (let i = 0; i < 5; i++) {
                    id += `${Math.floor(Math.random() * (9 - 1 + 1) + 1)}`;
                }
                interaction.client.channels.cache.get('973939815601045564').send(`Error [${id}]\n\`\`\`${e.stack}\`\`\``);
                await interaction.followUp({ content: `${lang.errors.init} [${id}]`, ephemeral: true });
        }
    },
};