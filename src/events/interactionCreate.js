const {
  Events,
  InteractionType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const config = require('../config');
const { writeFileSync } = require('fs');
const { useQueue, useHistory, QueueRepeatMode } = require('discord-player');
const Genius = require('genius-lyrics');
const { geniusKey } = require('../config');
const gClient = new Genius.Client(geniusKey);

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    let client = interaction.client;
    if (interaction.user.bot) return;
    const guildData = require(`../datas/guilds/${interaction.guild.id}/data.json`);
    const lang = require(`../locale/${guildData.lang}.json`);

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

          const queue = useQueue(interaction.guild.id);
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
        const queue = useQueue(interaction.guild.id);
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
            client.updateCurrentMenu(queue, true);
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
        const queue = useQueue(interaction.guild.id);
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
        const queue = useQueue(interaction.guild.id);
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
        const queue = useQueue(interaction.guild.id);
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
        const queue = useQueue(interaction.guild.id);
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
      }
    }
  }
};
