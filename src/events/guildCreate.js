const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    execute: async (guild) => {
        guild.client.configChecker([guild]);
    }
};