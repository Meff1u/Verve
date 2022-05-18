const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'queueEnd',
    player: true,
    async execute(queue) {
        const settings = require(`../guilds-data/${queue.guild.id}/settings.json`);
        const lang = require(`../langs/${settings.lang}.json`);
        setTimeout(async function() {
            const q = queue.player.getQueue(queue.guild.id);
            if (q.songs.length < 1) {
                await q.stop();
                const embed = new MessageEmbed()
                .setTitle(lang.events.queueEnd)
                .setColor('#FFFF00');
                queue.data.channel.send({ embeds: [embed] });
            }
        }, 60000);
    },
};