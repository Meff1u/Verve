module.exports = {
  name: 'playerResume',
  player: true,
  playerEvent: true,
  execute: async (queue, track) => {
    queue.player.client.updateCurrentMenu(queue, true);
  }
};
