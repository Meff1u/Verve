const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds a track or playlist to the queue.')
        .addSubcommand(subcommand => subcommand
            .setName('song')
            .setDescription('Adds a track to the queue.')
            .addStringOption(option => option
                .setName('input')
                .setDescription('Enter a title or paste a link to the song.')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('playlist')
            .setDescription('Adds a playlist to the queue.')
            .addStringOption(option => option
                .setName('input')
                .setDescription('Paste the link to the playlist.')
                .setRequired(true))),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();

        try {
            if (!gqueue) {
                gqueue = interaction.client.player.createQueue(interaction.guild.id, {
                    data: {
                        // eslint-disable-next-line comma-dangle
                        channel: interaction.channel,
                        // eslint-disable-next-line comma-dangle
                        initDJ: interaction.member
                    // eslint-disable-next-line comma-dangle
                    }
                });
            }

            await gqueue.join(interaction.member.voice.channel);
            const search = interaction.options.getString('input');
            if (interaction.options.getSubcommand() === 'song') {
                const song = await gqueue.play(search, {
                    requestedBy: interaction.member,
                });
                let embedtitle = '';
                if (song.isFirst) {
                    embedtitle = lang.commands.play.sTitle1;
                }
                else {
                    embedtitle = lang.commands.play.sTitle2;
                }
                const embed = new MessageEmbed()
                .setTitle(embedtitle)
                .setDescription(`**[${song.name}](${song.url})**`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `${lang.commands.play.sFooterPos} ${song.queue.songs.length} | ${lang.commands.play.sFooterRequested} ${song.requestedBy.user.tag}` })
                .setColor('#AB40AF');
                return await interaction.followUp({ embeds: [embed] });
            }
            else if (interaction.options.getSubcommand() === 'playlist') {
                const playlist = await gqueue.playlist(search, {
                    requestedBy: interaction.member,
                });
                const embed = new MessageEmbed()
                .setTitle(lang.commands.play.pTitle)
                .setDescription(`**[${playlist.name}](${playlist.url})**`)
                .setThumbnail(playlist.thumbnail)
                .setFooter({ text: `${lang.commands.play.pFooterSongs} ${playlist.songs.length} | ${lang.commands.play.sFooterRequested} ${playlist.songs[0].requestedBy.user.tag}` })
                .setColor('#AB40AF');
                return await interaction.followUp({ embeds: [embed] });
            }
        }
        catch (e) {
            if (e.stack.toString().includes('UnknownVoice')) {
                const embed = new MessageEmbed()
                .setTitle(lang.commands.play.noVC)
                .setColor('RED');
                return await interaction.followUp({ embeds: [embed] });
            }
            else if (e.stack.toString().includes(`Cannot set properties of undefined (setting 'data')`) || e.stack.toString().includes('SearchIsNull')) {
                const embed = new MessageEmbed()
                .setTitle(lang.commands.play.noSong)
                .setColor('RED');
                return await interaction.followUp({ embeds: [embed] });
            }
            else if (e.stack.toString().includes('InvalidPlaylist')) {
                const embed = new MessageEmbed()
                .setTitle(lang.commands.play.noPlaylist)
                .setColor('RED');
                return await interaction.followUp({ embeds: [embed] });
            }
            else if (e.stack.toString().includes('VoiceConnectionError')) {
                const embed = new MessageEmbed()
                .setTitle(lang.commands.play.vcError)
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