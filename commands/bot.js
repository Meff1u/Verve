const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const package = require('../package.json');
const os = require('os');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Informations about Verve.'),
    async execute(interaction, gqueue, settings, lang) {
        await interaction.deferReply();
        const { commands } = interaction.client;
        const gdata = require('../global-data/data.json');
        let uptime = '';
        let temptimestamp = Date.now() - interaction.client.readyTimestamp;
        do {
            const temp = `${ms(temptimestamp, { long: true })}`;
            temptimestamp = temptimestamp - ms(temp);
            uptime += `${temp} `;
        }
        while (temptimestamp > 999);
        const embed = new MessageEmbed()
        .setTitle(lang.commands.bot.title)
        .setDescription(`• ${lang.commands.bot.descID} **${interaction.client.user.id}**\n• ${lang.commands.bot.descAuthor} **${package.author}**\n• ${lang.commands.bot.descCreated} **<t:${Math.round(interaction.client.user.createdTimestamp / 1000)}:R>**`)
        .setColor('#AB40AF')
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFields(
            { name: lang.commands.bot.fieldStatsName, value: `> ${lang.commands.bot.fieldStatsDescGuilds} **${interaction.client.guilds.cache.size}**\n> ${lang.commands.bot.fieldStatsDescMembers} **${interaction.client.users.cache.size}**\n> ${lang.commands.bot.fieldStatsDescCommands} **${commands.size}**\n> ${lang.commands.bot.fieldStatsDescPlayed} **${gdata.songsPlayed}**\n> ⮡ ${lang.commands.bot.fieldStatsDescPlayedServer} **${settings.stats.songsPlayed}** (${Math.round((settings.stats.songsPlayed / gdata.songsPlayed) * 100)}%)` },
            { name: lang.commands.bot.fieldHostName, value: `> ${lang.commands.bot.fieldHostDescOS} **${process.platform}**\n> ${lang.commands.bot.fieldHostDescRAM} **${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)}/${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB** (${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%)\n> ${lang.commands.bot.fieldHostDescCPU} **${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB** (${os.cpus().length} cores)\n> ${lang.commands.bot.fieldHostDescUptime} **${uptime}**\n> ${lang.commands.bot.fieldHostDescPing} **${Math.round(interaction.client.ws.ping)}ms**` },
            { name: lang.commands.bot.fieldVersionsName, value: `> Verve: **${package.version}**\n> Node.js: **${process.versions.node}**\n> Discord.js: **${package.dependencies['discord.js'].replace('^', '')}**` },
        );
        await interaction.followUp({ embeds: [embed] });
    },
};