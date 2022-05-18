const fs = require('fs');

module.exports = {
    name: 'songAdd',
    player: true,
    async execute(queue) {
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
    },
};