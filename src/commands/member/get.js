const { download } = require('../../utils');
const { PREFIX } = require('../../config');

module.exports = {
    name: 'get',
    description: "baixa um arquivo",
    commands: ["get"],
    usage: `${PREFIX}get (marque o arquivo)`,
    handle: async ({
        webMessage,
    }) => {

        console.log(webMessage);
        console.log(webMessage.message);
    }
}
