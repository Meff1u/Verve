module.exports = {
  name: 'playerPause',
  player: true,
  playerEvent: true,
  execute: async (queue, track) => {
    queue.player.client.updateCurrentMenu(queue, false);
  }
};
