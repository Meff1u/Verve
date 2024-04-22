module.exports = {
  name: 'audioTrackAdd',
  player: true,
  playerEvent: true,
  execute: async (queue, track) => {
    queue.player.client.updateCurrentMenu(queue, false);
  }
};
