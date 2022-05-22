const index = require('../index.js');

module.exports = {
    name: 'error',
    player: true,
    async execute(error, queue) {
        console.error(`Queue error for ${queue.guild.name}:\n${error}`);
        let id = '';
        for (let i = 0; i < 5; i++) {
            id += `${Math.floor(Math.random() * (9 - 1 + 1) + 1)}`;
        }
        index.client.channels.cache.get('973939815601045564').send(`Queue error for ${queue.guild.name} [${id}]\n\`\`\`${error.stack}\`\`\``);
    },
};