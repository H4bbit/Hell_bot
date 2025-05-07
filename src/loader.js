const { TIMEOUT_IN_MS_BY_EVENT } = require('./config');
const { storeMessages } = require('./utils/database');
const { onMessagesUpsert } = require('./middlewares/onMessagesUpsert');

exports.load = (socket) => {
    socket.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        setTimeout(async () => {
            const msg = messages[0];
            const remoteJid = msg.key.remoteJid;
            //            const senderJid = message.key.participant || remoteJid;
            const content = msg.message;
            if (!content) return;
            // Salva no banco normalmente
            /*
                        await storeMessages(
                            remoteJid,
                            msg.key.id,
                            content,
                            //               msg.key.participant
                        );
            */
            await onMessagesUpsert({ socket, messages });
        }, TIMEOUT_IN_MS_BY_EVENT);
    });

    //    socket.ev.on("")
};
