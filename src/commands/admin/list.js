const { PREFIX, BOT_OWNER, BOT_NUMBER } = require('../../config');

module.exports = {
    name: 'listparticipants',
    description: 'Lista os participantes do grupo e suas permissões',
    commands: ['listparticipants', 'participants', 'list'],
    usage: `${PREFIX}listparticipants`,
    handle: async ({
        sendReply,
        remoteJid,
        socket
    }) => {
        try {
            const { participants } = await socket.groupMetadata(remoteJid);
            if (!participants || participants.length === 0) {
                return await sendReply('Não foi possível obter a lista de participantes.');
            }

            let message = '👥 *Lista de Participantes:*\n\n';

            participants.forEach(participant => {
                const isBotOwner = participant.id === `${BOT_OWNER}@s.whatsapp.net`;
                const isBotNumber = participant.id === `${BOT_NUMBER}@s.whatsapp.net`;
                let role = '';

                if (isBotOwner || isBotNumber) {
                    role = '👑 Dono do Bot';
                } else if (participant.admin === 'superadmin') {
                    role = '👑 Dono';
                } else if (participant.admin === 'admin') {
                    role = '🔧 Admin';
                } else {
                    role = '👤 Membro';
                }

                message += `• ${participant.id.replace('@s.whatsapp.net', '')} - ${role}\n`;
            });

            await sendReply(message);
        } catch (error) {
            console.error('Erro ao listar participantes:', error);
            await sendReply('Ocorreu um erro ao listar os participantes.');
        }
    }
};
