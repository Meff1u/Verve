const { useQueue } = require('discord-player');
const { Events } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');

module.exports = {
    name: Events.MessageDelete,
    execute: async (message) => {
        const guildData = JSON.parse(readFileSync(`./src/datas/guilds/${message.guild.id}/data.json`, 'utf-8'));
        if (message.id == guildData.playerMessage) {
            const queue = useQueue(message.guild.id);
            if (queue) queue.node.stop();
            delete guildData.playerMessage;
            delete guildData.playerChannel;

            writeFileSync(`./src/datas/guilds/${message.guild.id}/data.json`, JSON.stringify(guildData, null, 2));
        }
    }
}