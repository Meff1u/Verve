const fs = require('fs');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} jest gotowy grać dla ${client.guilds.cache.size} serwerów!`);
        setInterval(function() {
            client.user.setActivity(`${client.guilds.cache.size} guilds!`, { type: 'LISTENING' });
            setTimeout(function() {
                client.user.setActivity(`/help`, { type: 'LISTENING' });
                setTimeout(function() {
                    client.user.setActivity(`Rebuild in progress...`, { type: 'LISTENING' });
                }, 10000);
            }, 10000);
        }, 30000);
        await client.guilds.fetch();
        client.guilds.cache.forEach(async (g) => {
            if (!fs.existsSync(`././guilds-data/${g.id}`)) {
                createConfig(g);
            }
            await g.members.fetch();
        });

        setInterval(async function() {
            const gsettings = require(`../global-data/data.json`);
            if (!gsettings.minutesOnVC) gsettings.minutesOnVC = 0;
            client.guilds.cache.forEach(async (g) => {
                if (g.me.voice.channel) {
                    const settings = require(`../guilds-data/${g.id}/settings.json`);
                    if (!settings.stats) settings.stats = {};
                    if (!settings.stats.minutesOnVC) settings.stats.minutesOnVC = 0;
                    settings.stats.minutesOnVC += 1;
                    gsettings.minutesOnVC += 1;
                    fs.writeFileSync(`././guilds-data/${g.id}/settings.json`, JSON.stringify(settings, null, 4), err => {
                        if (err) throw err;
                    });
                }
            });
            fs.writeFileSync(`././global-data/data.json`, JSON.stringify(gsettings, null, 4), err => {
                if (err) throw err;
            });
        }, 60000);
    },
};

function createConfig(guild) {
    if (!fs.existsSync(`././guilds-data/${guild.id}`)) {
        fs.mkdirSync(`././guilds-data/${guild.id}`);
        console.log(`📁 ${guild.name} 💬`);
    }
    else {
        console.log(`📁 ${guild.name} ✅`);
    }
    if (!fs.existsSync(`././guilds-data/${guild.id}/settings.json`)) {
        fs.writeFileSync(`././guilds-data/${guild.id}/settings.json`, '{}');
        console.log(`⚙️ ${guild.name} 💬`);
        const settings = require(`../guilds-data/${guild.id}/settings.json`);
        settings.lang = 'en';
        settings.stats = {};
        settings.stats.songsPlayed = 0;
        settings.stats.minutesOnVC = 0;
        fs.writeFileSync(`././guilds-data/${guild.id}/settings.json`, JSON.stringify(settings, null, 4), err => {
            if (err) throw err;
        });
    }
    else {
        console.log(`⚙️ ${guild.name} ✅`);
    }
}