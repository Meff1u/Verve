const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  back: new ButtonBuilder()
    .setCustomId('m.back')
    .setEmoji('1231557341292531762')
    .setStyle(ButtonStyle.Primary),
  resume: new ButtonBuilder()
    .setCustomId('m.resume')
    .setEmoji('1231557502085234708')
    .setStyle(ButtonStyle.Primary),
  pause: new ButtonBuilder()
    .setCustomId('m.pause')
    .setEmoji('1231557859427483729')
    .setStyle(ButtonStyle.Primary),
  skip: new ButtonBuilder()
    .setCustomId('m.skip')
    .setEmoji('1231557748408324149')
    .setStyle(ButtonStyle.Primary),
  loopoff: new ButtonBuilder()
    .setCustomId('m.loopoff')
    .setEmoji('1231679789610438717')
    .setStyle(ButtonStyle.Primary),
  loopone: new ButtonBuilder()
    .setCustomId('m.loopone')
    .setEmoji('1231680660398411917')
    .setStyle(ButtonStyle.Primary),
  loopqueue: new ButtonBuilder()
    .setCustomId('m.loopqueue')
    .setEmoji('1231686905226199050')
    .setStyle(ButtonStyle.Primary),
  clean: new ButtonBuilder()
    .setCustomId('m.clean')
    .setEmoji('1231692071006638130')
    .setStyle(ButtonStyle.Primary),
  add: new ButtonBuilder()
    .setCustomId('m.add')
    .setEmoji('1231561324329177129')
    .setStyle(ButtonStyle.Success),
  queue: new ButtonBuilder()
    .setCustomId('m.queue')
    .setEmoji('1231681055937925231')
    .setStyle(ButtonStyle.Secondary),
  queuedisabled: new ButtonBuilder()
    .setCustomId('m.queuedisabled')
    .setEmoji('1231681055937925231')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true),
  stop: new ButtonBuilder()
    .setCustomId('m.stop')
    .setEmoji('1231643913060880528')
    .setStyle(ButtonStyle.Danger),
  shuffle: new ButtonBuilder()
    .setCustomId('m.shuffle')
    .setEmoji('1231762078105210890')
    .setStyle(ButtonStyle.Primary),
  search: new ButtonBuilder()
    .setCustomId('m.search')
    .setEmoji('1231763436049010760')
    .setStyle(ButtonStyle.Success),
  seek: new ButtonBuilder()
    .setCustomId('m.seek')
    .setEmoji('1231764685850808371')
    .setStyle(ButtonStyle.Primary),
  seekdisabled: new ButtonBuilder()
    .setCustomId('m.seekdisabled')
    .setEmoji('1231764685850808371')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
  jump: new ButtonBuilder()
    .setCustomId('m.jump')
    .setEmoji('1231766273386348604')
    .setStyle(ButtonStyle.Primary),
  lyrics: new ButtonBuilder()
    .setCustomId('m.lyrics')
    .setEmoji('1231766872693932114')
    .setStyle(ButtonStyle.Primary),
  lyricsdisabled: new ButtonBuilder()
    .setCustomId('m.lyricsdisabled')
    .setEmoji('1231766872693932114')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
  lyricsoff: new ButtonBuilder()
    .setCustomId('m.lyricsoff')
    .setEmoji('1231766872693932114')
    .setStyle(ButtonStyle.Danger),
  goback: new ButtonBuilder()
    .setCustomId('m.goback')
    .setEmoji('1231946291920244808')
    .setStyle(ButtonStyle.Secondary),
  left: new ButtonBuilder()
    .setCustomId('m.left')
    .setEmoji('1231947323379159081')
    .setStyle(ButtonStyle.Primary),
  leftdisabled: new ButtonBuilder()
    .setCustomId('m.leftdisabled')
    .setEmoji('1231947323379159081')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
  right: new ButtonBuilder()
    .setCustomId('m.right')
    .setEmoji('1231947324717137982')
    .setStyle(ButtonStyle.Primary),
  rightdisabled: new ButtonBuilder()
    .setCustomId('m.rightdisabled')
    .setEmoji('1231947324717137982')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true),
  remove: new ButtonBuilder()
    .setCustomId('m.remove')
    .setEmoji('1231949687284826203')
    .setStyle(ButtonStyle.Primary),
  radio: new ButtonBuilder()
    .setCustomId('m.radio')
    .setEmoji('1232471972831563827')
    .setStyle(ButtonStyle.Success)
    .setDisabled(false),
  cancel: new ButtonBuilder()
    .setCustomId('m.cancel')
    .setEmoji('1298724255902597181')
    .setStyle(ButtonStyle.Danger)
};
