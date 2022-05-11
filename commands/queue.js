const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Lists the songs that are queued.'),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();

        if (!gqueue || gqueue.songs.length === 0) {
            const embed = new MessageEmbed()
            .setTitle(lang.command.queue.noQueue)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        let qdesc = '';
        let num = gqueue.songs.length;
        if (num > 15) num = 15;
        for (let i = 0; i < num; i++) {
            qdesc += `${i + 1}. **[${gqueue.songs[i].name}](${gqueue.songs[i].url})** (${gqueue.songs[i].requestedBy})\n`;
        }
        const adesc = gqueue.songs.length === num ? '' : `... + ${gqueue.songs.length - num} więcej`;
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

        /*
        if (!interaction.guild.me.voice.channelId) return interaction.followUp({ content: '❌ | Nie ma mnie na kanale głosowym!', ephemeral: true });
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) return interaction.followUp({ content: '❌ | Musisz być na tym samym kanale co ja!', ephemeral: true });
        const queue = player.getQueue(interaction.guild.id);
        if (!queue) return interaction.followUp({ content: '❌ | Obecnie nic nie gram!', ephemeral: true });
        if (!interaction.options.page) interaction.options.page = 1;
        const pstart = 10 * (interaction.options.page - 1);
        const current = queue.current;
        const tracks = queue.tracks.map((m, i) => {
            return `${i + pstart + 1}. [${m.title}](${m.url}) | \`${m.duration}\` (${m.requestedBy})`;
        });
        const pages = Math.ceil(tracks.length / 10);
        let page = 0;
        let nextup = '';
        for (let i = 0; i < 10;i++) {
            if (tracks[i]) {
                nextup = nextup + `${tracks[i]}\n\n`;
            }
        }


        const embed = new MessageEmbed()
        .setTitle(`Kolejka ${interaction.guild.name}`)
        .setDescription(`__Teraz odtwarzane:__\n🔊 | [${current.title}](${current.url}) | \`${current.duration}\` (${current.requestedBy})\n\n__Następne:__\n${nextup}`)
        .setColor('#AB40AF')
        .setThumbnail(interaction.guild.iconURL())
        .setFooter(`${queue.tracks.length} utworów | Strona: ${page + 1}/${pages}`);
        const butp = new MessageButton();
        butp.setCustomId('queuep');
        butp.setLabel('<= Poprzednia');
        butp.setStyle('SECONDARY');
        if (page === 0) {
           butp.setDisabled(true);
        }
        const butn = new MessageButton();
        butn.setCustomId('queuen');
        butn.setLabel('Następna =>');
        butn.setStyle('SECONDARY');
        if (page + 1 === pages || pages === 0) {
            butn.setDisabled(true);
        }
        const row = new MessageActionRow().addComponents(butp, butn);
        await interaction.followUp({ embeds: [embed], components: [row] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 40000 });

            collector.on('collect', i => {
                if (i.user.id === interaction.user.id) {
                    if (i.customId === 'queuen') {
                        page = page + 1;
                        let nextupp = '';
                        for (let l = 0; l < 10; l++) {
                            const ii = l + (page * 10);
                            if (tracks[ii]) {
                                nextupp = nextupp + `${tracks[ii]}\n\n`;
                            }
                        }
                        const embed1 = new MessageEmbed();
                        embed1.setTitle(`Kolejka ${interaction.guild.name}`);
                        embed1.setDescription(`__Teraz odtwarzane:__\n🔊 | [${current.title}](${current.url}) | \`${current.duration}\` (${current.requestedBy})\n\n__Następne:__\n${nextupp}`);
                        embed1.setColor('#AB40AF');
                        embed1.setThumbnail(interaction.guild.iconURL());
                        embed1.setFooter(`${queue.tracks.length} utworów | Strona: ${page + 1}/${pages}`);
                        const but1 = new MessageButton();
                        but1.setCustomId('queuep');
                        but1.setLabel('<= Poprzednia');
                        but1.setStyle('SECONDARY');
                        if (page === 0) {
                            but1.setDisabled(true);
                        }
                        const but2 = new MessageButton();
                        but2.setCustomId('queuen');
                        but2.setLabel('Następna =>');
                        but2.setStyle('SECONDARY');
                        if (page + 1 === pages) {
                            but2.setDisabled(true);
                        }
                        const roww = new MessageActionRow().addComponents(but1, but2);
                        i.update({ embeds: [embed1], components: [roww] });
                    }
                    else if (i.customId === 'queuep') {
                        page = page - 1;
                        let nextupp = '';
                        for (let l = 0; l < 10; l++) {
                            const ii = l + (page * 10);
                            if (tracks[ii]) {
                                nextupp = nextupp + `${tracks[ii]}\n\n`;
                            }
                        }
                        const embed1 = new MessageEmbed();
                        embed1.setTitle(`Kolejka ${interaction.guild.name}`);
                        embed1.setDescription(`__Teraz odtwarzane:__\n🔊 | [${current.title}](${current.url}) | \`${current.duration}\` (${current.requestedBy})\n\n__Następne:__\n${nextupp}`);
                        embed1.setColor('#AB40AF');
                        embed1.setThumbnail(interaction.guild.iconURL());
                        embed1.setFooter(`${queue.tracks.length} utworów | Strona: ${page + 1}/${pages}`);
                        const but1 = new MessageButton();
                        but1.setCustomId('queuep');
                        but1.setLabel('<= Poprzednia');
                        but1.setStyle('SECONDARY');
                        if (page === 0) {
                            but1.setDisabled(true);
                        }
                        const but2 = new MessageButton();
                        but2.setCustomId('queuen');
                        but2.setLabel('Następna =>');
                        but2.setStyle('SECONDARY');
                        if (page + 1 === pages) {
                            but2.setDisabled(true);
                        }
                        const roww = new MessageActionRow().addComponents(but1, but2);
                        i.update({ embeds: [embed1], components: [roww] });
                    }
                }
            });
        });
        */
    },
};