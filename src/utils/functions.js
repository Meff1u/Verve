const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { existsSync, writeFileSync, mkdirSync } = require('fs');
const moment = require('moment');
const dt = require('duration-time-conversion');
const progressbar = require('string-progressbar');

module.exports = {
  execute: async (client) => {
    // Custom log
    client.log = function (message) {
      console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${message}`);
    };

    // Country code to flag emoji
    client.codeToFlag = function (code) {
      const codePoints = code
        .toUpperCase()
        .split('')
        .map((letter) => 0x1f1e6 - 65 + letter.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    // Replace Variables
    client.repVars = function (string, vars) {
      for (const v in vars) {
        const value = vars[v];
        string = string.replace(`{${v}}`, value);
      }
      return string;
    };

    // Config checker
    client.configChecker = function (guilds) {
      guilds.forEach((g) => {
        if (existsSync(`./src/datas/guilds/${g.id}`)) {
          if (!existsSync(`./src/datas/guilds/${g.id}/data.json`)) {
            writeFileSync(
              `./src/datas/guilds/${g.id}/data.json`,
              JSON.stringify({ lang: 'us' }, null, 2),
              'utf8'
            );
            client.log(`Created missing data file for ${g.name}`);
          }
        } else {
          mkdirSync(`./src/datas/guilds/${g.id}`, { recursive: true });
          writeFileSync(
            `./src/datas/guilds/${g.id}/data.json`,
            JSON.stringify({ lang: 'us' }, null, 2),
            'utf8'
          );
          client.log(`Created data directory for ${g.name}`);
        }
      });
    };

    // Send trackback
    client.sendTrackback = function (error, errorId, channel) {
      return channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${error.message}`)
            .setColor('#ff0000')
            .setFooter({ text: `Error ID: ${errorId}` })
            .setDescription(error.stack.slice(0, 2048))
        ]
      });
    };

    // Generate error ID
    client.genErrorId = function () {
      return Math.floor(10000 + Math.random() * 90000);
    };

    // Get queue tracks
    function getQueueTracks(queue, page) {
      page -= 1;
      return queue.tracks.data.slice(page * 10, page * 10 + 10).map((track, i) => {
        return `**${page * 10 + i + 1}.** [${track.title}](${track.url}) [${track.duration}] (${
          track.requestedBy
        })`;
      });
    }

    // Update current menu
    client.updateCurrentMenu = function (queue, doInterval, action) {
      const lang = queue.options.metadata.lang;

      // Finish the menu if there are no more tracks in the queue
      if (action == 'finish' && queue.tracks.data.length == 0) {
        clearInterval(queue.menuUpdateInterval);
        const row = createActionRow([client.buttons.add, client.buttons.search]);
        queue.updateEmbed = createEmbed(
          `Verve - ${lang.commands.start.readyToPlay}`,
          null,
          null,
          client.mainColor,
          { text: `Host: ${queue.options.metadata.interaction.user.tag}` },
          lang.commands.start.readyDescription
        );
        return editPlayerMessage(queue.playerMessage, [queue.updateEmbed], [row]);
      }

      // Queue menu
      else if (action?.split('-')[0] == 'queue') {
        if ((queue.tracks.data.length == 0) | !queue)
          return interaction.reply({ content: lang.music.emptyQueue, ephemeral: true });
        clearInterval(queue.menuUpdateInterval);

        const page = parseInt(action.split('-')[1]);
        const totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;

        const leftbutton = page == 1 ? client.buttons.leftdisabled : client.buttons.left;
        const rightbutton =
          page == totalPages ? client.buttons.rightdisabled : client.buttons.right;

        const row = createActionRow([
          client.buttons.goback,
          leftbutton,
          client.buttons.jump,
          client.buttons.remove,
          rightbutton
        ]);
        queue.updateEmbed = createEmbed(
          client.repVars(lang.music.queueMenuTitle, {
            guildname: queue.options.metadata.interaction.guild.name
          }),
          null,
          null,
          client.mainColor,
          {
            text: `${lang.music.page} ${page}/${totalPages} | Host: ${queue.options.metadata.interaction.user.tag}`
          },
          getQueueTracks(queue, page).join('\n')
        );

        queue.queueInt.deferUpdate();
        delete queue.queueInt;
        return editPlayerMessage(queue.playerMessage, [queue.updateEmbed], [row]);
      }
      const track = queue.currentTrack;
      if (!track) return;

      // Update the menu
      let currentTextDuration = dt.d2t(Math.floor(queue.node.playbackTime / 1000)).split('.')[0];
      let splitDuration = currentTextDuration.split(':');
      if (splitDuration[0] == '00') splitDuration.shift();
      currentTextDuration = splitDuration.join(':');

      queue.updateEmbed = createEmbed(
        `${track.author} - ${track.title}`,
        track.url,
        track.thumbnail || null,
        client.mainColor,
        {
          text: `Host: ${queue.options.metadata.interaction.user.tag} | ${lang.music.songsInQueue}: ${queue.tracks.data.length}`
        }
      );

      if (track.queryType != 'arbitrary') {
        queue.updateEmbed.addFields({
          name: `${currentTextDuration} / ${track.duration}`,
          value: progressbar.filledBar(
            dt.t2d(track.duration),
            Math.floor(queue.node.playbackTime / 1000),
            25,
            '◻',
            '◼'
          )[0],
          inline: false
        });
      }
      queue.updateEmbed.addFields({
        name: '\u200B',
        value: `${lang.music.addedBy}: ${track.requestedBy}`,
        inline: true
      });

      let thridButtonRow2 = client.buttons.lyrics;

      const embeds = [queue.updateEmbed];

      // Lyrics embed
      if (queue.lyrics) {
        thridButtonRow2 = client.buttons.lyricsoff;
        const lyricsEmbed = createEmbed(
          `${track.author} - ${track.title}`,
          null,
          null,
          client.mainColor,
          null,
          queue.lyrics.slice(0, 4096)
        );
        embeds.push(lyricsEmbed);
      }

      // Buttons row 1
      let fifthButtonRow1;
      let thridButtonRow1;

      queue.repeatMode == 0
        ? (fifthButtonRow1 = client.buttons.loopoff)
        : queue.repeatMode == 1
        ? (fifthButtonRow1 = client.buttons.loopone)
        : (fifthButtonRow1 = client.buttons.loopqueue);

      if (queue.node.isPaused()) {
        queue.updateEmbed.data.author = { name: lang.music.pausedTitle };
        thridButtonRow1 = client.buttons.resume;
      } else {
        queue.updateEmbed.data.author = { name: lang.music.nowPlayingTitle };
        thridButtonRow1 = client.buttons.pause;
      }

      if (track.queryType == 'arbitrary') {
        queue.updateEmbed.data.author = { name: lang.music.arbitraryTitle };
      }

      const menuRow1 = createActionRow([
        client.buttons.shuffle,
        client.buttons.back,
        thridButtonRow1,
        client.buttons.skip,
        fifthButtonRow1
      ]);

      // Buttons row 2

      let forthButtonRow2;
      let firstButtonRow2;

      if (track.queryType == 'arbitrary') {
        firstButtonRow2 = client.buttons.seekdisabled;
        thridButtonRow2 = client.buttons.lyricsdisabled;
      } else {
        firstButtonRow2 = client.buttons.seek;
      }

      if (queue.tracks.data.length > 0) {
        queue.updateEmbed.addFields({
          name: 'Next up:',
          value: `[${queue.tracks.data[0].title}](${queue.tracks.data[0].url})`,
          inline: true
        });
        forthButtonRow2 = client.buttons.queue;
      } else {
        forthButtonRow2 = client.buttons.queuedisabled;
      }

      const menuRow2 = createActionRow([
        firstButtonRow2,
        client.buttons.clean,
        thridButtonRow2,
        forthButtonRow2,
        client.buttons.stop
      ]);

      // Buttons row 3

      const menuRow3 = createActionRow([client.buttons.add, client.buttons.search]);

      editPlayerMessage(queue.playerMessage, embeds, [menuRow1, menuRow2, menuRow3]);
      if (queue.queueInt) {
        queue.queueInt.deferUpdate();
        delete queue.queueInt;
      }

      if (queue.menuUpdateInterval) {
        if (queue.node.isPaused() || track.queryType == 'arbitrary') {
          clearInterval(queue.menuUpdateInterval);
          queue.menuUpdateInterval = null;
        }
      } else if (doInterval && track.queryType != 'arbitrary') {
        queue.menuUpdateInterval = setInterval(() => {
          if (queue.node.isPaused()) {
            clearInterval(queue.menuUpdateInterval);
            queue.menuUpdateInterval = null;
          } else {
            client.updateCurrentMenu(queue, true);
          }
        }, queue.intervalDuration);
      }
    };

    // Create action row
    function createActionRow(buttons) {
      const row = new ActionRowBuilder();
      buttons.forEach((button) => row.addComponents(button));
      return row;
    }

    // Edit player message
    function editPlayerMessage(playerMessage, embeds, components) {
      return playerMessage.edit({
        embeds: embeds,
        components: components
      });
    }

    // Create embed
    function createEmbed(title, url, thumbnail, color, footer, description) {
      const embed = new EmbedBuilder()
        .setTitle(title || null)
        .setURL(url || null)
        .setThumbnail(thumbnail || null)
        .setColor(color || null)
        .setFooter(footer || null)
        .setDescription(description || null);
      return embed;
    }
  }
};
