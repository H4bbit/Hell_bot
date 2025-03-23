const PREFIX = require('../../config');

module.exports = {
    name: 'ping',
    description: 'Ping Pong',
    commands: ['ping'],
    usage: `${PREFIX}ping`,
    handle: async ({ sendReply, sendReact }) => {
        console.log('ping!');
        await sendReact("🏓");
        await sendReply("🏓 pong");
    },
};
