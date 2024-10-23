const {
  Events,
  InteractionType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const config = require('../config');
const { writeFileSync } = require('fs');
const { useQueue, useHistory, QueueRepeatMode } = require('discord-player');
const Genius = require('genius-lyrics');
const { geniusKey } = require('../config');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const gClient = new Genius.Client(geniusKey);

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    let client = interaction.client;
    if (interaction.user.bot) return;
    const guildData = require(`../datas/guilds/${interaction.guild.id}/data.json`);
    const lang = require(`../locale/${guildData.lang}.json`);
    const queue = useQueue(interaction.guild.id);

    // Command Handler
    if (interaction.type == InteractionType.ApplicationCommand) {
      try {
        const cmd = client.commands.get(interaction.commandName);

        if (cmd.ownerOnly && !config.owners.has(interaction.user.id)) {
          return interaction.reply({
            content: lang.common.noPermission,
            ephemeral: true
          });
        }

        if (cmd.cooldown) {
          if (client.cooldown.has(`${cmd.data.name}-${interaction.user.id}`)) {
            const now = interaction.createdTimestamp;
            const timeleft = client.cooldown.get(`${cmd.data.name}-${interaction.user.id}`) - now;
            const finaltime = Math.floor(new Date(now + timeleft).getTime() / 1000);
            return interaction.reply({
              content: client.repVars(lang.events.interactionCreate.cooldownMessage, {
                remaining: `<t:${finaltime}:R>`
              }),
              ephemeral: true
            });
          }

          cmd.run(client, interaction, guildData, lang);
          client.cooldown.set(`${cmd.data.name}-${interaction.user.id}`, Date.now() + cmd.cooldown);
          setTimeout(() => {
            client.cooldown.delete(`${cmd.data.name}-${interaction.user.id}`);
          }, cmd.cooldown + 1000);
        } else {
          cmd.run(client, interaction, guildData, lang);
        }
      } catch (error) {
        console.error(error);
        let errorId = client.genErrorId();
        client.sendTrackback(error, errorId, client.trackBackChannel);
        return interaction.reply({
          content: client.repVars(lang.common.errorId, { errorId: errorId }),
          ephemeral: true
        });
      }
    }

    // Button/Select Menu Handler
    else if (interaction.type == 3) {
      // Language switch Handler
      if (interaction.customId == 'language') {
        const newlang = interaction.values[0];
        const guildData = require(`../datas/guilds/${interaction.guild.id}/data.json`);
        guildData.lang = newlang;
        const lang = require(`../locale/${newlang}.json`);
        try {
          writeFileSync(
            `./src/datas/guilds/${interaction.guild.id}/data.json`,
            JSON.stringify(guildData, null, 2)
          );

          if (queue) queue.options.metadata.lang = lang;

          const e = new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription(`**${lang.commands.language.languageChanged}**`);
          return await interaction.update({ embeds: [e], components: [] });
        } catch (error) {
          console.error(error);
          let errorId = client.genErrorId();
          client.sendTrackback(error, errorId, client.trackBackChannel);
          return interaction.update({
            content: client.repVars(lang.common.errorId, { errorId: errorId }),
            ephemeral: true
          });
        }
      }

      // Help Buttons Handler
      else if (interaction.customId == 'helpButtonsInfo') {
        const buttonInfoEmbed = new EmbedBuilder()
          .setTitle(`Verve - ${lang.commands.help.buttonTitle}`)
          .setColor(client.mainColor)
          .setThumbnail(client.user.avatarURL())
          .setDescription(lang.commands.help.buttonDescription)
          .setFooter({
            text: `v${client.package.version}`,
            iconURL: client.user.avatarURL()
          });

        const button = new ButtonBuilder()
          .setCustomId('commandsInfo')
          .setStyle(ButtonStyle.Success)
          .setLabel(lang.commands.help.commandsTitle);
        const aboutbutton = new ButtonBuilder()
          .setCustomId('aboutInfo')
          .setStyle(ButtonStyle.Success)
          .setLabel(lang.commands.help.aboutTitle);

        const row = new ActionRowBuilder().addComponents(button, aboutbutton);

        await interaction.update({ embeds: [buttonInfoEmbed], components: [row] });
      }

      // Commands Info Handler
      else if (interaction.customId == 'commandsInfo') {
        const commandsEmbed = new EmbedBuilder()
          .setTitle(`Verve - ${lang.commands.help.commandsTitle}`)
          .setColor(client.mainColor)
          .setThumbnail(client.user.avatarURL())
          .setFooter({ text: `v${client.package.version}`, iconURL: client.user.avatarURL() })
          .setDescription(
            client.commands
              .map(
                (cmd) =>
                  `</${cmd.data.name}:${cmd.id}> - ${
                    lang.commands[cmd.data.name].detailedDescription
                  }`
              )
              .join('\n')
          );

        const button = new ButtonBuilder()
          .setCustomId('helpButtonsInfo')
          .setStyle(ButtonStyle.Success)
          .setLabel(lang.commands.help.buttonTitle);
        const aboutbutton = new ButtonBuilder()
          .setCustomId('aboutInfo')
          .setStyle(ButtonStyle.Success)
          .setLabel(lang.commands.help.aboutTitle);

        const row = new ActionRowBuilder().addComponents(button, aboutbutton);

        await interaction.update({ embeds: [commandsEmbed], components: [row] });
      }

      // Music Player Buttons Handler
      else if (interaction.customId.startsWith('m.')) {
        if (!queue)
          return interaction.reply({
            content: lang.music.noActiveQueue,
            ephemeral: true
          });
        if (interaction.message.interaction.id != queue.options.metadata.interaction.id)
          return interaction.reply({
            content: lang.music.wrongMenuPlayer,
            ephemeral: true
          });
        switch (interaction.customId) {
          case 'm.add':
            const queryModal = new ModalBuilder()
              .setCustomId('m.query')
              .setTitle(lang.music.addModalTitle);
            const input = new TextInputBuilder()
              .setCustomId('m.inputquery')
              .setLabel(lang.music.addModalDescription)
              .setMaxLength(200)
              .setRequired(true)
              .setPlaceholder(lang.music.addModalPlaceholder)
              .setStyle(TextInputStyle.Short);

            const modalRow = new ActionRowBuilder().addComponents(input);
            queryModal.addComponents(modalRow);

            await interaction.showModal(queryModal);
            break;
          case 'm.pause':
            await queue.node.setPaused(true);
            await interaction.reply({
              content: lang.music.paused,
              ephemeral: true
            });
            break;
          case 'm.resume':
            await queue.node.setPaused(false);
            await interaction.reply({
              content: lang.music.resumed,
              ephemeral: true
            });
            break;
          case 'm.back':
            await interaction.deferReply({ ephemeral: true });
            const history = useHistory(interaction.guild.id);
            if (history.tracks.data.length == 0)
              return interaction.reply({
                content: lang.music.noPlaybackHistory,
                ephemeral: true
              });
            await history.back();
            await interaction.editReply({
              content: lang.music.previousSong,
              ephemeral: true
            });
            break;
          case 'm.skip':
            if (!queue.currentTrack)
              return interaction.reply({ content: lang.music.noTrackToSkip, ephemeral: true });
            await queue.node.skip();
            await interaction.reply({
              content: lang.music.skipped,
              ephemeral: true
            });
            break;
          case ['m.loopoff', 'm.loopone', 'm.loopqueue'].includes(interaction.customId)
            ? interaction.customId
            : null:
            switch (interaction.customId) {
              case 'm.loopoff':
                await queue.setRepeatMode(QueueRepeatMode.TRACK);
                await interaction.reply({
                  content: lang.music.loopSingle,
                  ephemeral: true
                });
                break;
              case 'm.loopone':
                await queue.setRepeatMode(QueueRepeatMode.QUEUE);
                await interaction.reply({
                  content: lang.music.loopQueue,
                  ephemeral: true
                });
                break;
              case 'm.loopqueue':
                await queue.setRepeatMode(QueueRepeatMode.OFF);
                await interaction.reply({
                  content: lang.music.loopDisabled,
                  ephemeral: true
                });
                break;
            }
            interaction.client.updateCurrentMenu(queue, false);
            break;
          case 'm.shuffle':
            if (queue.tracks.length < 2)
              return interaction.reply({
                content: lang.music.shuffleError,
                ephemeral: true
              });
            await queue.tracks.shuffle();
            await interaction.reply({
              content: lang.music.shuffled,
              ephemeral: true
            });
            client.updateCurrentMenu(queue, false);
            break;
          case 'm.seek':
            const seekModal = new ModalBuilder()
              .setCustomId('m.seekModal')
              .setTitle(lang.music.seekModalTitle);

            const inputSeek = new TextInputBuilder()
              .setCustomId('m.seekModalInput')
              .setLabel(lang.music.seekModalDescription)
              .setRequired(true)
              .setPlaceholder('60')
              .setStyle(TextInputStyle.Short);

            const modalRowSeek = new ActionRowBuilder().addComponents(inputSeek);
            seekModal.addComponents(modalRowSeek);

            await interaction.showModal(seekModal);
            break;
          case 'm.jump':
            const jumpModal = new ModalBuilder()
              .setCustomId('m.jumpModal')
              .setTitle(lang.music.jumpModalTitle);

            const inputJump = new TextInputBuilder()
              .setCustomId('m.jumpModalInput')
              .setLabel(lang.music.jumpModalDescription)
              .setRequired(true)
              .setPlaceholder('5')
              .setStyle(TextInputStyle.Short);

            const modalRowJump = new ActionRowBuilder().addComponents(inputJump);
            jumpModal.addComponents(modalRowJump);

            await interaction.showModal(jumpModal);
            break;
          case 'm.remove':
            const removeModal = new ModalBuilder()
              .setCustomId('m.removeModal')
              .setTitle(lang.music.removeModalTitle);

            const inputRemove = new TextInputBuilder()
              .setCustomId('m.removeModalInput')
              .setLabel(lang.music.removeModalDescription)
              .setRequired(true)
              .setPlaceholder('6')
              .setStyle(TextInputStyle.Short);

            const modalRowRemove = new ActionRowBuilder().addComponents(inputRemove);
            removeModal.addComponents(modalRowRemove);

            await interaction.showModal(removeModal);
            break;
          case 'm.radio':
            queue.radioInt = interaction;
            client.updateCurrentMenu(queue, false, 'radio');
            break;
          case 'm.queue':
            queue.queueInt = interaction;
            queue.queuePage = 1;
            client.updateCurrentMenu(queue, false, 'queue-1');
            break;
          case 'm.goback':
            queue.queueInt = interaction;
            queue.menuUpdateInterval = null;
            if (queue.currentTrack || queue.tracks.data.length > 0) {
              client.updateCurrentMenu(queue, true);
            } else {
              client.updateCurrentMenu(queue, false, 'finish');
            }
            break;
          case 'm.left':
            queue.queueInt = interaction;
            queue.queuePage -= 1;
            client.updateCurrentMenu(queue, false, `queue-${queue.queuePage}`);
            break;
          case 'm.right':
            queue.queueInt = interaction;
            queue.queuePage += 1;
            client.updateCurrentMenu(queue, false, `queue-${queue.queuePage}`);
            break;
          case 'm.stop':
            await queue.delete();
            const pChannel = interaction.guild.channels.cache.get(guildData.playerChannel);
            await pChannel.messages.fetch(guildData.playerMessage).then((msg) => msg.delete());
            break;
          case 'm.clean':
            await queue.node.stop();
            client.updateCurrentMenu(queue, false, 'finish');
            break;
          case 'm.lyrics':
            const searchResults = await gClient.songs.search(
              `${queue.currentTrack.title} ${queue.currentTrack.author}`
            );
            const lyrics = await searchResults[0]?.lyrics();
            if (lyrics && searchResults[0]) {
              queue.lyrics = lyrics;
              queue.lyricsTrack = queue.currentTrack.id;
              interaction.deferUpdate();
              client.updateCurrentMenu(queue, false);
            } else {
              await interaction.reply({
                content: lang.music.noLyricsFound,
                ephemeral: true
              });
            }
            break;
          case 'm.lyricsoff':
            delete queue.lyrics;
            delete queue.lyricsTrack;
            interaction.deferUpdate();
            client.updateCurrentMenu(queue, false);
            break;
          case 'm.search':
            const searchModal = new ModalBuilder()
              .setCustomId('m.search')
              .setTitle(lang.music.searchModalTitle);

            const inputSearch = new TextInputBuilder()
              .setCustomId('m.inputsearch')
              .setLabel(lang.music.searchModalDescription)
              .setRequired(true)
              .setPlaceholder('Darude - Sandstorm')
              .setStyle(TextInputStyle.Short);

            const modalRowSearch = new ActionRowBuilder().addComponents(inputSearch);
            searchModal.addComponents(modalRowSearch);

            await interaction.showModal(searchModal);
            break;
          case 'm.searchradio':
            const searchRadioModal = new ModalBuilder()
              .setCustomId('m.searchradio')
              .setTitle(lang.music.searchRadioModalTitle);

            const inputRadio = new TextInputBuilder()
              .setCustomId('m.searchradioInput')
              .setLabel(lang.music.searchRadioModalDescription)
              .setRequired(true)
              .setPlaceholder('Jazz')
              .setStyle(TextInputStyle.Short);

            const modalRowRadio = new ActionRowBuilder().addComponents(inputRadio);
            searchRadioModal.addComponents(modalRowRadio);

            await interaction.showModal(searchRadioModal);
            break;
          case 'm.radioSelect':
            const selectedRadio = queue.radioSearchResults[parseInt(interaction.values[0])];
            if (!queue) {
              return interaction.reply({
                content: lang.common.error,
                ephemeral: true
              });
            }

            await interaction.reply({ content: lang.music.addingRadioToQueue, ephemeral: true });

            try {
              const { track } = await client.player.play(
                interaction.member.voice.channel,
                selectedRadio.url_resolved,
                {
                  nodeOptions: {
                    metadata: {
                      interaction: interaction,
                      client: client
                    }
                  },
                  requestedBy: interaction.user
                }
              );

              await interaction.followUp({
                content: client.repVars(lang.music.addedToQueue, {
                  track: track.title
                }),
                ephemeral: true
              });
            } catch (e) {
              console.log(e);
              let errorId = client.genErrorId();
              client.sendTrackback(e, errorId, client.trackBackChannel);
              return interaction.reply({
                content: client.repVars(lang.common.errorId, { errorId: errorId }),
                ephemeral: true
              });
            }
            break;
          case 'm.searchSelect':
            const selectedTrack = interaction.values[0];
            if (!queue) {
              return interaction.reply({
                content: lang.common.error,
                ephemeral: true
              });
            }

            await interaction.reply({ content: lang.music.addingSearchToQueue, ephemeral: true });

            try { 
              const { track } = await client.player.play(interaction.member.voice.channel, selectedTrack, {
                nodeOptions: {
                  metadata: {
                    interaction: interaction,
                    client: client
                  }
                },
                requestedBy: interaction.user
              });

              await interaction.followUp({
                content: client.repVars(lang.music.addedToQueue, {
                  track: track.title
                }),
                ephemeral: true
              });
            } catch (e) {
              console.log(e);
              let errorId = client.genErrorId();
              client.sendTrackback(e, errorId, client.trackBackChannel);
              return interaction.reply({
                content: client.repVars(lang.common.errorId, { errorId: errorId }),
                ephemeral: true
              });
            }

            break;
          default:
            await interaction.reply({
              content: lang.common.thisShouldNeverHappen,
              ephemeral: true
            });
            break;
        }
      }
    }
    // Modals Handler
    else if (interaction.type == 5) {
      // Adding song to queue
      if (interaction.customId == 'm.query') {
        await interaction.deferReply({ ephemeral: true });
        const query = interaction.fields.getTextInputValue('m.inputquery');
        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        try {
          const { track } = await client.player.play(interaction.member.voice.channel, query, {
            nodeOptions: {
              metadata: {
                interaction: interaction,
                client: client
              }
            },
            requestedBy: interaction.user
          });

          await interaction.editReply({
            content: client.repVars(lang.music.addedToQueue, {
              track: track.title
            }),
            ephemeral: true
          });
        } catch (e) {
          if (e.message.includes('[ERR_NO_RESULT]')) {
            return interaction.editReply({
              content: lang.music.noResults,
              ephemeral: true
            });
          } else if (e.message.includes('[ERR_OUT_OF_SPACE]')) {
            return interaction.editReply({
              content: lang.music.outOfSpace,
              ephemeral: true
            });
          } else if (e.message.includes('Max capacity reached')) {
            return interaction.editReply({
              content: lang.music.maxCapacity,
              ephemeral: true
            });
          } else {
            console.log(e);
            let errorId = client.genErrorId();
            client.sendTrackback(e, errorId, client.trackBackChannel);
            return interaction.editReply({
              content: client.repVars(lang.common.errorId, { errorId: errorId }),
              ephemeral: true
            });
          }
        }
      } else if (interaction.customId == 'm.seekModal') {
        await interaction.deferReply({ ephemeral: true });
        const seekTime = interaction.fields.getTextInputValue('m.seekModalInput');
        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        try {
          await queue.node.seek(parseInt(seekTime) * 1000);
          client.updateCurrentMenu(queue, false);
          await interaction.editReply({
            content: client.repVars(lang.music.seeked, { time: seekTime }),
            ephemeral: true
          });
        } catch (e) {
          console.log(e);
          return interaction.editReply({
            content: lang.common.error,
            ephemeral: true
          });
        }
      } else if (interaction.customId == 'm.jumpModal') {
        await interaction.deferReply({ ephemeral: true });
        const jumpPosition = parseInt(interaction.fields.getTextInputValue('m.jumpModalInput'));
        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        if (queue.tracks.length < jumpPosition || jumpPosition < 1) {
          return interaction.editReply({
            content: lang.music.invalidSongNumber,
            ephemeral: true
          });
        }
        try {
          await queue.node.skipTo(jumpPosition - 1);
          client.updateCurrentMenu(queue, false);
          await interaction.editReply({
            content: client.repVars(lang.music.jumped, { position: jumpPosition }),
            ephemeral: true
          });
        } catch (e) {
          console.log(e);
          return interaction.editReply({
            content: lang.common.error,
            ephemeral: true
          });
        }
      } else if (interaction.customId == 'm.removeModal') {
        const removePosition = parseInt(interaction.fields.getTextInputValue('m.removeModalInput'));
        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        if (queue.tracks.length < removePosition || removePosition < 1) {
          return interaction.editReply({
            content: lang.music.invalidSongNumber,
            ephemeral: true
          });
        }
        try {
          await queue.node.remove(removePosition - 1);
          queue.queueInt = interaction;
          client.updateCurrentMenu(queue, false, `queue-${queue.queuePage}`);
        } catch (e) {
          console.log(e);
          let errorId = client.genErrorId();
          client.sendTrackback(e, errorId, client.trackBackChannel);
          return interaction.editReply({
            content: client.repVars(lang.common.errorId, { errorId: errorId }),
            ephemeral: true
          });
        }
      } else if (interaction.customId == 'm.searchradio') {
        const radioSearch = interaction.fields.getTextInputValue('m.searchradioInput');

        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });

        try {
          queue.radioSearchResults = await fetch(
            `https://de1.api.radio-browser.info/json/stations/search?limit=25&name=${radioSearch}&hidebroken=true&order=clickcount&reverse=true`
          ).then((res) => res.json());
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('m.radioSelect')
            .setPlaceholder(lang.music.radioSelectPlaceholder)
            .setMinValues(1)
            .setMaxValues(1);

          queue.radioSearchResults.forEach((result) => {
            selectMenu.addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel(result.name)
                .setValue(queue.radioSearchResults.indexOf(result).toString())
                .setDescription(result.homepage || lang.music.radioNoHomepage)
                .setEmoji(client.codeToFlag(result.countrycode) || '🌐')
            );
          });

          const row = new ActionRowBuilder().addComponents(selectMenu);
          await interaction.update({ components: [row] });
        } catch (e) {
          console.log(e);
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        }
      } else if (interaction.customId == 'm.search') {
        const searchQuery = interaction.fields.getTextInputValue('m.inputsearch');
        if (!queue)
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        try {
          const searchResults = await client.player.search(searchQuery, {
            requestedBy: interaction.user
          });
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('m.searchSelect')
            .setPlaceholder(lang.music.searchSelectPlaceholder)
            .setMinValues(1)
            .setMaxValues(1);

          const uniqueValues = new Set();

          for (let i = 0; i < 25; i++) {
            if (!searchResults.tracks[i]) break;
            const value = searchResults.tracks[i].url;

            if (!uniqueValues.has(value)) {
              selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(searchResults.tracks[i].title)
                  .setValue(value)
                  .setDescription(searchResults.tracks[i].author)
                  .setEmoji('🎵')
              );
              uniqueValues.add(value);
            }
          }

          const row = new ActionRowBuilder().addComponents(selectMenu);
          await interaction.update({ components: [row] });
        } catch (e) {
          console.log(e);
          return interaction.reply({
            content: lang.common.error,
            ephemeral: true
          });
        }
      }
    }
  }
};
