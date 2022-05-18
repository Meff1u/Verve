module.exports = {
    name: 'error',
    player: true,
    async execute(error, queue) {
        console.error(`${queue.guild.name}:\n${error}`);
    },
};