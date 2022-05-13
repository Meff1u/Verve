const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
// const trans = require('translate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek the current track to the entered time.')
        .addStringOption(option => option
            .setName('time')
            .setDescription('E.g: 1m 20s')
            .setRequired(true)),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        if (!gqueue || gqueue.songs.length === 0) {
            const embed = new MessageEmbed()
            .setTitle(lang.commands.queue.noQueue)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }

        const time = interaction.options.getString('time').split(' ');
        let mstime = 0;
        for (let i = 0; i < time.length; i++) {
            mstime += ms(time[i]);
        }
        await gqueue.seek(mstime);
        const embed = new MessageEmbed()
        .setTitle(`✅ Forwared to ${ms(mstime, { long: true })}`)
        .setColor('#AB40AF');
        return await interaction.followUp({ embeds: [embed] });
    },
};