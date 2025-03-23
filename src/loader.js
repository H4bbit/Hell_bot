const { TIMEOUT_IN_MS_BY_EVENT } = require('./config');
const { onMessagesUpsert } = require('./middlewares/onMessagesUpsert');

const { storeMessages} = require('./utils/database');

//essa função é responsável por carregar os eventos 
exports.load = (socket) => {
    //upsert é um evento que é emitido pelo baileys quando uma mensagem é enviada
    socket.ev.on("messages.upsert", async ({ messages }) => {
        //configurado um delay para evitar que o bot seja banido
        setTimeout(() => {
            //armazena as mensagens no banco de dados
            storeMessages(messages[0].key.remoteJid,
                messages[0].key.id,
                messages[0].message
            );

            //passa o socket e as mensagens para o middleware onMessagesUpsert
            //o middleware é responsável por processar as mensagens
            onMessagesUpsert({ socket, messages });
        }, TIMEOUT_IN_MS_BY_EVENT);
    });
}
