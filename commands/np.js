const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Displays the currently played song.'),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        if (interaction.member.voice.channel !== interaction.guild.me.voice.channel) {
            const embed = new MessageEmbed()
            .setTitle(lang.errors.sameChannel)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        if (!gqueue || !gqueue.isPlaying) {
            const embed = new MessageEmbed()
            .setTitle(lang.commands.np.noPlaying)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        try {
            const progress = gqueue.createProgressBar({
                arrow: '🔘',
                size: 30,
                block: '▬',
            });
            const embed = new MessageEmbed()
            .setTitle(lang.commands.np.title)
            .setDescription(`**[${gqueue.nowPlaying.name}](${gqueue.nowPlaying.url})**\n\`${progress.prettier}\``)
            .setColor('#AB40AF')
            .setFooter({ text: `${lang.commands.np.addedBy} ${gqueue.nowPlaying.requestedBy.user.tag}` })
            .setThumbnail(gqueue.nowPlaying.thumbnail);
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