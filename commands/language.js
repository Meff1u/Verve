const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const fs = require ('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Changes the bot language.')
        .addStringOption(option => option
            .setName('lang')
            .setDescription('Choose language.')
            .setRequired(true)
            .addChoice('Polski (Polish 🇵🇱)', 'pl')
            .addChoice('English (🇬🇧)', 'en')),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const embed = new MessageEmbed()
            .setTitle(lang.errors.noADM)
            .setColor('RED');
            return await interaction.followUp({ embeds: [embed] });
        }
        try {
            const language = interaction.options.getString('lang');
            settings.lang = language;
            fs.writeFileSync(`././guilds=data/${interaction.guild.id}/settings.json`, JSON.stringify(settings, null, 4), err => {
                if (err) throw err;
            });
            const lang2 = require(`../langs/${language}.json`);
            const embed = new MessageEmbed()
            .setTitle(`✅ ${lang2.langChange}`)
            .setColor('#AB40AF');
            return await interaction.followUp({ embeds: [embed] });
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
    },
};