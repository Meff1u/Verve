const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Clears the queue and leaves the voice channel.'),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        if (!gqueue || gqueue.songs.length === 0) {
            const embed = new MessageEmbed()
            .setTitle(lang.commands.queue.noQueue)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        try {
            await gqueue.stop();
            const embed = new MessageEmbed()
            .setTitle(lang.commands.stop.cya)
            .setColor('#AB40AF');
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