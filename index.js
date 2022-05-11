const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once('ready', async () => {
    console.log(`${client.user.tag} is ready to play!`);
    await client.guilds.fetch();
});

client.login(token);