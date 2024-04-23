const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Player } = require('discord-player');
const { readdirSync } = require('node:fs');
const package = require('./package.json');
const config = require('./src/config');
const buttonConfig = require('./src/buttonConfig');

const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: Object.values(Partials),
  shards: 'auto'
});

client.mainColor = '#F0C3E0';
client.buttons = buttonConfig;
client.player = new Player(client, {
  skipFFmpeg: false
});
client.package = package;

async function loadUtils() {
  const utilFiles = readdirSync('./src/utils');
  const utilPromises = utilFiles.map((file) => require(`./src/utils/${file}`).execute(client));
  return Promise.all(utilPromises);
}

async function loadDefaultExtractors() {
  await client.player.extractors.loadDefault((ext) => ext !== 'YouTubeExctractor');
}

async function init() {
  try {
    await loadUtils();
    await loadDefaultExtractors();
    await client.login(config.token);
  } catch (error) {
    console.error('Init error:\n', error);
  }
}

init();
