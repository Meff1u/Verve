const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'songChanged',
    player: true,
    async execute(queue, newSong) {
        const settings = require(`../guilds-data/${queue.guild.id}/settings.json`);
        const gsettings = require(`../global-data/data.json`);
        if (!settings.stats) settings.stats = {};
        if (!settings.stats.songsPlayed) settings.stats.songsPlayed = 0;
        settings.stats.songsPlayed += 1;
        if (!gsettings.songsPlayed) gsettings.songsPlayed = 0;
        gsettings.songsPlayed += 1;
        fs.writeFileSync(`././guilds-data/${queue.guild.id}/settings.json`, JSON.stringify(settings, null, 4), err => {
            if (err) throw err;
        });
        fs.writeFileSync(`././global-data/data.json`, JSON.stringify(gsettings, null, 4), err => {
            if (err) throw err;
        });

        const lang = require(`../langs/${settings.lang}.json`);
        const embed = new MessageEmbed()
        .setTitle(lang.commands.np.title)
        .setDescription(`**[${newSong.name}](${newSong.url})**`)
        .setFields(
            { name: lang.commands.play.sFieldDur, value: `> ${newSong.duration}` },
        )
        .setColor('#AB40AF')
        .setFooter({ text: `${lang.commands.np.addedBy} ${newSong.requestedBy.user.tag}` })
        .setThumbnail(newSong.thumbnail);
        await queue.data.channel.send({ embeds: [embed] });
    },
};