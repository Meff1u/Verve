const { Permissions, MessageAttachment } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const client = interaction.client;
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            const settings = require(`../guilds-data/${interaction.guild.id}/settings.json`);
            const lang = require(`../langs/${settings.lang}.json`);
            if (!interaction.channel.permissionsFor(interaction.guild.me).has(Permissions.FLAGS.VIEW_CHANNEL)) return await interaction.reply({ content: lang.errors.permViewChannel, ephemeral: true });
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
                fs.writeFileSync('././fullqueue.txt', desc, (err) => {
                    if (err) throw err;
                });
                const txt = new MessageAttachment('./fullqueue.txt', 'fullqueue.txt');
                await interaction.reply({ files: [txt] });
                interaction.message.edit({ components: [] });
            }
        }
    },
};