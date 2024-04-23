module.exports = {
    name: 'error',
    player: true,
    playerEvent: true,
    execute: async (queue, error) => {
      console.log(`Error for queue: ${queue.options.guild.id}\n${error}`);
    }
  };
  