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

        if (!gqueue) {
            gqueue = interaction.client.player.createQueue(interaction.guild.id, {
                data: {
                    // eslint-disable-next-line comma-dangle
                    channel: interaction.channel
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
            .setFooter({ text: `${lang.commands.play.sFooterRequested} ${playlist.songs[0].requestedBy.user.tag}` })
            .setColor('#AB40AF');
            return await interaction.followUp({ embeds: [embed] });
        }

        /* if (!interaction.guild.me.voice.channelId) {
            if (!interaction.member.voice.channelId) return await interaction.followUp({ content: '❌ | Musisz dołączyć na kanał głosowy!', ephemeral: true });
            const queue = player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel,
                    leaveOnEnd: false,
                    leaveOnEmpty: false,
                    leaveOnEmptyCooldown: 10000
                }
            });

            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            }
            catch {
                queue.destroy();
                return await interaction.followUp({ content: "❌ | Nie mogę dołączyć na ten kanał!", ephemeral: true });
            }
        }
        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });
        const query = interaction.options.getString('utwór');
        // eslint-disable-next-line no-lonely-if
        if (interaction.member.voice.channelId === interaction.guild.me.voice.channelId) {
            const track = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (!track) return await interaction.followUp({ content: `❌ | Nie odnaleziono \`${query}\`, spróbuj ponownie!` });

            if (track.playlist) {
                queue.addTracks(track.playlist.tracks);
                const embed = new MessageEmbed()
                .setTitle(track.playlist.title)
                .setURL(track.playlist.url)
                .setThumbnail(track.playlist.thumbnail)
                .setFooter(`Dodano ${track.playlist.tracks.length} utworów!`)
                .setTimestamp(Date.now())
                .setColor("#AB40AF");
                await interaction.followUp({ content: `🔊 | Dodano utwory z playlisty:`, embeds: [embed] });
            }
            else {
                queue.addTrack(track.tracks[0]);
                const embed = new MessageEmbed()
                .setTitle(track.tracks[0].title)
                .setURL(track.tracks[0].url)
                .setThumbnail(track.tracks[0].thumbnail)
                .setTimestamp(Date.now())
                .setColor("#AB40AF")
                .addField('Autor', `${track.tracks[0].author}`, true)
                .addField('Czas trwania', `${track.tracks[0].duration}`, true)
                .setFooter(`${track.tracks[0].views} wyświetleń`);
                await interaction.followUp({ content: `🔊 | Dodano utwór:`, embeds: [embed] });
            }
            if (!queue.playing) await queue.play();
        }
        else {
            await interaction.followUp({ content: '❌ | Musisz być na tym samym kanale co ja!', ephemeral: true });
        } */
    },
};