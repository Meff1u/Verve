const { Client, Intents, Collection, MessageAttachment } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const { Player } = require('discord-music-player');
const player = new Player(client, {
    leaveOnEmpty: true,
    deafenOnJoin: true,
    leaveOnEnd: false,
    leaveOnStop: true,
    timeout: 300,
});
client.player = player;

client.once('ready', async () => {
    console.log(`${client.user.tag} jest gotowy grać dla ${client.guilds.cache.size} serwerów!`);
    client.user.setActivity('TRWA REBUILD BOTA', { type: 'LISTENING' });
    await client.guilds.fetch();
    client.guilds.cache.forEach(async (g) => {
        if (!fs.existsSync(`./guilds-data/${g.id}`)) {
            createConfig(g);
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        const settings = require(`./guilds-data/${interaction.guild.id}/settings.json`);
        const lang = require(`./langs/${settings.lang}.json`);
        try {
            // eslint-disable-next-line prefer-const
            let gqueue = client.player.getQueue(interaction.guild.id);
            command.execute(interaction, gqueue, settings, lang);
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
    }
    else if (interaction.isButton()) {
        if (interaction.customId === 'fullqueue') {
            const q = interaction.client.player.getQueue(interaction.guild.id);
            let desc = '';
            for (let i = 0; i < q.songs.length; i++) {
                desc += `${i + 1}. ${q.songs[i].name} (${q.songs[i].requestedBy.user.tag})\n`;
            }
            fs.writeFileSync('fullqueue.txt', desc, (err) => {
                if (err) throw err;
            });
            const txt = new MessageAttachment('fullqueue.txt', 'fullqueue.txt');
            await interaction.reply({ files: [txt] });
            interaction.message.edit({ components: [] });
        }
    }
});

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

client.login(token);