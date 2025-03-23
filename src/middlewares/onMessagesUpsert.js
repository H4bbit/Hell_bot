const { loadCommonFunctions } = require('../utils/loadCommonFunctions');
const { dynamicCommand } = require('../utils/dynamicCommand');

// essa funcão é chamada toda vez que uma mensagem é recebida
exports.onMessagesUpsert = async ({ socket, messages }) => {
    //se não houver mensagens, não faz nada
    if (!messages.length) {
        return;
    }
    //para cada mensagem recebida, carrega as funções comuns 
    //e executa o comando dinâmico
    for (const webMessage of messages) {
        const commonFunctions = loadCommonFunctions({ socket, webMessage });
        //se não houver funções comuns, pula para a próxima mensagem
        if (!commonFunctions) {
            continue;
        }
        await dynamicCommand(commonFunctions);
    }
};
