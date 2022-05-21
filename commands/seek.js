const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
// const trans = require('translate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek the current song to the entered time.')
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
        let uptime = '';
        let tempms = mstime;
        do {
            const temp = `${ms(tempms, { long: true })}`;
            tempms = tempms - ms(temp);
            uptime += `${temp} `;
        }
        while (tempms > 999);
        try {
            await gqueue.seek(mstime);
            const embed = new MessageEmbed()
            .setTitle(`✅ ${lang.commands.seek.forwarded} ${uptime}`)
            .setColor('#AB40AF');
            return await interaction.followUp({ embeds: [embed] });
        }
        catch (e) {
            if (e.stack.toString().includes('val=null')) {
                const embed = new MessageEmbed()
                .setTitle(lang.commands.seek.error)
                .setColor('RED');
                return await interaction.followUp({ embeds: [embed] });
            }
            else {
                console.error(e);
                let id = '';
                for (let i = 0; i < 5; i++) {
                    id += `${Math.floor(Math.random() * (9 - 1 + 1) + 1)}`;
                }
                interaction.client.channels.cache.get('973939815601045564').send(`Error [${id}]\n\`\`\`${e.stack}\`\`\``);
                await interaction.followUp({ content: `${lang.errors.init} [${id}]`, ephemeral: true });
            }
        }
    },
};