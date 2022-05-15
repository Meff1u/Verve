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
            if (!fs.existsSync(`./guilds-data/${g.id}`)) {
                createConfig(g);
            }
        });
    },
};

function createConfig(guild) {
    if (!fs.existsSync(`./guilds-data/${guild.id}`)) {
        fs.mkdirSync(`./guilds-data/${guild.id}`);
        console.log(`Stworzono folder konfiguracyjny dla: "${guild.name}"`);
    }
    else {
        console.log(`Folder konfiguracyjny dla: "${guild.name}" istnieje, pomijam...`);
    }
    if (!fs.existsSync(`./guilds-data/${guild.id}/settings.json`)) {
        fs.writeFileSync(`./guilds-data/${guild.id}/settings.json`, '{}');
        console.log(`Stworzono plik ustawień dla: "${guild.name}"`);
        const settings = require(`./guilds-data/${guild.id}/settings.json`);
        settings.lang = 'en';
        fs.writeFileSync(`./guilds-data/${guild.id}/settings.json`, JSON.stringify(settings, null, 4), err => {
            if (err) throw err;
        });
    }
    else {
        console.log(`Plik ustawień dla: "${guild.name}"" istnieje, pomijam...`);
    }
}