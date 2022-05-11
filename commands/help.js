const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the available commands.')
        .addStringOption(option => option
            .setName('command')
            .setDescription('Type command name for more info.')
            .setRequired(false)),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        const command = interaction.options.getString('command');
        const { commands } = interaction.client;
        if (!command) {
            let cmds = '';
            commands.forEach(cmd => {
                cmds += `> • \`${cmd.data.name}\` - ${lang.commands[cmd.data.name].desc}\n`;
            });
            const embed = new MessageEmbed()
            .setTitle(lang.commands.help.title)
            .setDescription(cmds)
            .setColor('#AB40AF')
            .setFooter({ iconURL: interaction.client.user.displayAvatarURL(), text: lang.commands.help.footer })
            .setFields(
                { name: '\u200B', value: '\u200B' },
                { name: lang.commands.help.helpName, value: lang.commands.help.helpValue },
            )
            .setThumbnail(interaction.client.user.displayAvatarURL());
            return await interaction.followUp({ embeds: [embed] });
        }
        else {
            const fcmd = commands.get(command);
            if (!fcmd) return await interaction.followUp({ content: lang.commands.help.cNoCommand });
            const embed = new MessageEmbed()
            .setTitle(`${lang.commands.help.cTitle} ${command}`)
            .setColor('#AB40AF')
            .setDescription(lang.commands[command].details)
            .setThumbnail(interaction.client.user.displayAvatarURL());
            return await interaction.followUp({ embeds: [embed] });
        }
    },
};