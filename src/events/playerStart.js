const dt = require('duration-time-conversion');

module.exports = {
  name: 'playerStart',
  player: true,
  playerEvent: true,
  execute: async (queue, track) => {
    delete queue.lyrics;
    delete queue.lyricsTrack;
    let interval = Math.ceil(dt.t2d(track.duration) / 25);
    queue.intervalDuration = Math.max(8, Math.min(interval, 20));
    queue.player.client.updateCurrentMenu(queue, true);
  }
};
