/*
const { BOT_OWNER } = require("../config");
exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
    if (type === 'member') {
        return true;
    }

    try {
        const { participants, owner } = await socket.groupMetadata(remoteJid);

        console.log(participants, owner);

        const participant = participants.find(
            (participant) => participant.id === userJid
        );

        if (!participant) {
            return false;
        }

        const isOwner = participant.id === owner
            || participant.admin === 'superadmin';

        const isAdmin = participant.admin === 'admin';

        const isBotOwner = userJid === `${BOT_OWNER}@s.whatsapp.net`;

        if (type === 'admin') {
            return isAdmin || isBotOwner;
        }
        if (type === 'owner') {
            return isBotOwner;
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};
*/
const { BOT_OWNER, BOT_NUMBER } = require("../config");

/** 
    * verifica se o usuário tem permissão
    * @param {Object} params - Parâmetros da verificação.
    * @param {'member' | 'admin' | 'owner' } params.type - Tipo de permissão a ser verificada.
    * @param {import('baileys').WASocket} params.socket - Objeto de socket do WhatsApp.}
    * @param {string} params.userJid - JID do usuário a ser verificado.
    * @param {string} params.remoteJid - JID do grupo.
    * @returns {Promise<boolean>} - Retorna true se o usuário tem permissão, false caso contrário.
    */
exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
    if (type === 'member') {
        return true;
    }

    try {
        const { participants } = await socket.groupMetadata(remoteJid);
        //    console.log('Participants:', participants);

        const participant = participants.find(p => p.id === userJid);
        if (!participant) {
            return false;
        }

        const isSuperAdmin = participant.admin === 'superadmin';
        const isAdmin = participant.admin === 'admin';
        const isBotOwner = userJid === `${BOT_OWNER}@s.whatsapp.net`;
        const isBotNumber = userJid === `${BOT_NUMBER}@s.whatsapp.net`;

        // Verifica se o usuário é admin ou dono
        if (type === 'admin') {
            return isSuperAdmin || isAdmin || isBotOwner;
        }

        // Verifica se o usuário é o dono ou o número do bot
        if (type === 'owner') {
            console.log(userJid, isBotNumber, isBotOwner, BOT_NUMBER, BOT_OWNER);
            return isBotNumber || isBotOwner;
        }

        return false;
    } catch (error) {
        console.error('Erro em checkPermission:', error);
        return false;
    }
};
