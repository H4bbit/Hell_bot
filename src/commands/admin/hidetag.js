const PREFIX = require('../../config');

module.exports = {
    name: 'hidetag',
    description: 'marca todos os menbros do grupo',
    commands: ['hidetag', 'totag'],
    usage: `${PREFIX}hidetag <mensagem>`,
    handle: async ({
        fullArgs,
        sendText,
        sendReact,
        remoteJid,
        socket
    }) => {
        if (!fullArgs) {
            await sendText("Por favor, forneça uma mensagem para marcar todos os membros.");
            return;
        }
        try {
            await sendReact("✅");

            const { participants } = await socket.groupMetadata(remoteJid);

            let mentions = participants.map((user) => user.id);

            await sendReact("📢");
            await sendText(`📢 Marcando todos!\n\n${fullArgs}`, mentions);

        } catch (error) {
            console.error("Erro ao marcar todos os membros:", error);
            await sendText("Ocorreu um erro ao marcar todos os membros.");
        }

    },
}
