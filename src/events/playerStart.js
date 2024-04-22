const dt = require('duration-time-conversion');

module.exports = {
  name: 'playerStart',
  player: true,
  playerEvent: true,
  execute: async (queue, track) => {
    queue.intervalDuration = Math.ceil(dt.t2d(track.duration) / 25) * 1000;
    queue.player.client.updateCurrentMenu(queue, true);
  }
};
