module.exports = {
  name: 'playerError',
  player: true,
  playerEvent: true,
  execute: async (queue, error) => {
    if (error.message.includes('Could not extract stream for this track')) {
        queue.options.metadata.interaction.channel.send({ content: queue.options.metadata.lang.music.couldNotExtractStream }).then((msg) => {
            setTimeout(() => {
                msg.delete();
            }, 7000);
        });
    }
    queue.player.client.sendTrackback(error, queue.player.client.genErrorId(), queue.player.client.trackBackChannel);
  }
};
