const axios = require('axios');
const { PREFIX } = require('../../config');
const {
    InvalidParameterError,
} = require(`../../errors`);

module.exports = {
    name: 'r34pack',
    description: 'Busca imagens e vídeos no Rule34 e envia em pack',
    commands: ['r34pack', 'rule34pack'],
    usage: `${PREFIX}r34pack <N> <tags>`,
    handle: async ({
        sendImageFromURL,
        sendVideoFromURL,
        args,
        sendReact,
        sendReply,
        sendWaitReact,
        sendSuccessReact
    }) => {
        //args sempre sera uma aarray de uma unica string 
        // exemplo: r34pack 5 naruto  1girls
        // args = ['5 naruto 1girls']
        console.log(args);
        //se nao passar argumentos envia mennsagem de parametros incorretos 
        if (!args || args.length === 0) {
            throw new InvalidParameterError('Digite um número e um termo para pesquisar no Rule34, exemplo: r34pack 5 naruto.');
        }
        await sendWaitReact();
        //limpa os argumentos e separa o numero do limite de imagens e as tags
        const packArgs = args[0].trim().split(' ');
        console.log(packArgs);
        //tira o limit de args e transforma em um numero inteiro
        const limit = parseInt(packArgs.shift());
        console.log('Limit:', limit);
        //o limit nao pode ser 0 ou negativo 
        if (isNaN(limit) || limit <= 0) {
            throw new InvalidParameterError('O primeiro argumento deve ser um número válido maior que 0.');
        }
        // precisa ser imformado pelo menos uma tag 
        if (packArgs.length === 0) {
            throw new InvalidParameterError('Você precisa informar pelo menos uma tag para buscar.');
        }
        //na url as tags sao separadas por + exemplo: naruto+1girls
        const url_base = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1";
        const tags = packArgs.join('+');
        console.log('Tags para busca:', tags);
        const requestUrl = `${url_base}&limit=${limit}&tags=${tags}`;
        console.log('URL da requisição:', requestUrl);
        const response = await axios.get(requestUrl);
        //verifica se a resposta da api foi sucesso 
        if (response.status !== 200) {
            throw new InvalidParameterError('Erro ao buscar imagens.' + `status code: ${response.status}`);
        }
        console.log(response.data);
        //a resposta da api e um array de objetos com as image ens
        //cada objeto tem o campo file_url que e a url da imagem
        //e tambem tem tags que e uma string com as tags separadas por espaco
        //na api pode ter videos, gifs e imagens
        const r34Array = response.data;
        if (r34Array.length === 0) {
            throw new InvalidParameterError('Nenhuma imagem/video/gif encontrada.');
        }
        for (const obj of r34Array) {
            //verifica se no link e um mp4/gif/png/jpg/jpeg
            if (obj.file_url.endsWith('.mp4')) {
                await sendVideoFromURL(r34Array.file_url);
            } else if (obj.file_url.endsWith('.gif')) {
                await sendVideoFromURL(obj.file_url, gifPlayback = true);
            } else {
                await sendImageFromURL(obj.file_url);
            }
        }

    }
}
