const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
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

    // Check if a string is a URL
    client.isURL = function (str) {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ); // fragment locator
      return !!pattern.test(str);
    };

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
        const row = new ActionRowBuilder().addComponents(client.buttons.add, client.buttons.search);
        queue.updateEmbed = new EmbedBuilder()
          .setTitle(`Verve - ${lang.commands.start.readyToPlay}`)
          .setColor(client.mainColor)
          .setDescription(lang.commands.start.readyDescription)
          .setFooter({ text: `Host: ${queue.options.metadata.interaction.user.tag}` });
        return queue.playerMessage.edit({
          embeds: [queue.updateEmbed],
          components: [row]
        });
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

        const row = new ActionRowBuilder().addComponents(
          client.buttons.goback,
          leftbutton,
          client.buttons.jump,
          client.buttons.remove,
          rightbutton
        );
        queue.updateEmbed = new EmbedBuilder()
          .setTitle(
            client.repVars(lang.music.queueMenuTitle, {
              guildname: queue.options.metadata.interaction.guild.name
            })
          )
          .setColor(client.mainColor);

        queue.updateEmbed.setDescription(getQueueTracks(queue, page).join('\n'));
        queue.updateEmbed.setFooter({
          text: `${lang.music.page} ${page}/${totalPages} | Host: ${queue.options.metadata.interaction.user.tag}`
        });

        queue.queueInt.deferUpdate();
        delete queue.queueInt;
        return queue.playerMessage.edit({
          embeds: [queue.updateEmbed],
          components: [row]
        });
      }
      const track = queue.currentTrack;
      if (!track) return;

      // Update the menu
      let currentTextDuration = dt.d2t(Math.floor(queue.node.playbackTime / 1000)).split('.')[0];
      let splitDuration = currentTextDuration.split(':');
      if (splitDuration[0] == '00') splitDuration.shift();
      currentTextDuration = splitDuration.join(':');

      queue.updateEmbed = new EmbedBuilder()
        .setTitle(`${track.author} - ${track.title}`)
        .setURL(track.url)
        .setThumbnail(track.thumbnail || null)
        .setColor(client.mainColor)
        .setFooter({
          text: `Host: ${queue.options.metadata.interaction.user.tag} | ${lang.music.songsInQueue}: ${queue.tracks.data.length}`
        });

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
      if (queue.lyrics) {
        thridButtonRow2 = client.buttons.lyricsoff;
        const lyricsEmbed = new EmbedBuilder()
          .setTitle(`${track.author} - ${track.title}`)
          .setColor(client.mainColor)
          .setDescription(queue.lyrics.slice(0, 4096));

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

      const menuRow1 = new ActionRowBuilder().addComponents(
        client.buttons.shuffle,
        client.buttons.back,
        thridButtonRow1,
        client.buttons.skip,
        fifthButtonRow1
      );

      // Buttons row 2

      let forthButtonRow2;
      let firstButtonRow2;

      if (track.queryType == 'arbitrary') {
        firstButtonRow2 = client.buttons.seekdisabled;
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

      const menuRow2 = new ActionRowBuilder().addComponents(
        firstButtonRow2,
        client.buttons.clean,
        thridButtonRow2,
        forthButtonRow2,
        client.buttons.stop
      );

      // Buttons row 3

      const menuRow3 = new ActionRowBuilder().addComponents(
        client.buttons.add,
        client.buttons.search
      );

      queue.playerMessage.edit({
        embeds: embeds,
        components: [menuRow1, menuRow2, menuRow3]
      });
      if (queue.queueInt) {
        queue.queueInt.deferUpdate();
        delete queue.queueInt;
      }

      if (doInterval && track.queryType != 'arbitrary') {
        clearInterval(queue.menuUpdateInterval);
        queue.menuUpdateInterval = setInterval(() => {
          if (queue.node.isPaused()) {
            return clearInterval(queue.menuUpdateInterval);
          }

          client.updateCurrentMenu(queue, true);
        }, queue.intervalDuration);
      }
    };
  }
};
