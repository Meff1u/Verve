const { readdirSync } = require('node:fs');

module.exports = {
  execute: async (client) => {
    const eventFile = readdirSync('./src/events');

    Promise.all(
      eventFile.map(async (file) => {
        const event = await require(`../events/${file}`);

        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else if (event.player) {
          if (event.playerEvent) {
            client.player.events.on(event.name, (...args) => event.execute(...args));
          } else {
            client.player.on(event.name, (...args) => event.execute(...args));
          }
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
      })
    );

    process.on('unhandledRejection', (e) => {
      console.log(e);
      client.sendTrackback(e, client.genErrorId(), client.trackBackChannel);
    });
    process.on('uncaughtException', (e) => {
      console.log(e);
      client.sendTrackback(e, client.genErrorId(), client.trackBackChannel);
    });
    process.on('uncaughtExceptionMonitor', (e) => {
      console.log(e);
      client.sendTrackback(e, client.genErrorId(), client.trackBackChannel);
    });
  }
};
