const { Collection } = require('discord.js');
const { readdirSync } = require('node:fs');

module.exports = {
  execute: async (client) => {
    client.commands = new Collection();
    client.commandDatas = [];
    client.cooldown = new Collection();

    const commandDir = readdirSync('./src/commands');

    Promise.all(
      commandDir.map(async (category) => {
        const commandFile = await readdirSync(`./src/commands/${category}`);

        await Promise.all(
          commandFile.map(async (file) => {
            const cmd = await require(`../commands/${category}/${file}`);

            if (cmd) {
              client.commands.set(cmd.data.name, cmd);
              client.commandDatas.push(cmd.data.toJSON());
            }
          })
        );
      })
    );
  }
};
