const { ActivityType, Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } = require('fs');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: async (client) => {
    // Activity
    // const activities = [``];
    // let currentActivity = 0;
    // const botActivity = () => {
    //   client.user.presence.set({
    //     activities: [
    //       {
    //         name: `${activities[currentActivity++ % activities.length]}`,
    //         type: ActivityType.Listening
    //       }
    //     ]
    //   });

    //   setTimeout(botActivity, 60000);
    // };
    // botActivity();

    // Config Checker
    configChecker(client);

    // Clean old player message
    cleanOldPlayerMessage(client);

    // addingIds to the commands
    await cmdIds(client);

    // Starting message
    client.log(`${client.user.username} want to play some music!`);

    // Command Register
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: client.commandDatas
      });
    } catch (error) {
      console.error(error);
    }
  }
};

function cleanOldPlayerMessage(client) {
  const guildsDataPath = './src/datas/guilds';
  const guildsDirectiories = readdirSync(guildsDataPath);

  try {
    for (const guildDir of guildsDirectiories) {
      const guildDataPath = `${guildsDataPath}/${guildDir}/data.json`;
  
      if (existsSync(guildDataPath)) {
        const guildData = JSON.parse(readFileSync(guildDataPath, 'utf8'));
        if (guildData.playerChannel && guildData.playerMessage) {
          const channel = client.channels.cache.get(guildData.playerChannel);
          if (channel) {
            channel.messages.fetch(guildData.playerMessage).then((msg) => {
              msg.delete();
            });
          }
        }
  
        delete guildData.playerChannel;
        delete guildData.playerMessage;
        writeFileSync(guildDataPath, JSON.stringify(guildData, null, 2));
      }
    }
  } catch (e) {
    if (e.message.includes('Unknown Message')) {
      client.log('Old player message not found');
    }
  }
}

function configChecker(client) {
  client.guilds.cache.forEach((g) => {
    if (existsSync(`./src/datas/guilds/${g.id}`)) {
      if (!existsSync(`./src/datas/guilds/${g.id}/data.json`)) {
        writeFileSync(`./src/datas/guilds/${g.id}/data.json`, JSON.stringify({ lang: 'us' }, null, 2), 'utf8');
        client.log(`Created missing data file for ${g.name}`);
      }
    } else {
      mkdirSync(`./src/datas/guilds/${g.id}`, { recursive: true });
      writeFileSync(`./src/datas/guilds/${g.id}/data.json`, JSON.stringify({ lang: 'us' }, null, 2), 'utf8');
      client.log(`Created data directory for ${g.name}`);
    }
  });
}

async function cmdIds(client) {
  const commands = await client.application.commands.fetch();
  commands.map(command => {
    const cmd = client.commands.get(command.name);
    if (cmd) {
      cmd.id = command.id;
    }
  });
}