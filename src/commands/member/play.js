const { PREFIX, TEMP_DIR } = require('../../config');
const axios = require('axios');
const path = require("path");
const fs = require("fs");
const { getRandomNumber } = require(`../../utils`);
//https://carisys.online/api/downloads/youtube/play?query=shihiro
/*
{ 
  "status": true,
  "código": 200,
  "resultado": {
    "imagem": "https://i.ytimg.com/vi/BY_XwvKogC8/hq720.jpg",
    "titulo": "Billie Eilish - CHIHIRO (Official Music Video)",
    "desc": "Directed by Billie Eilish Listen to HIT ME HARD AND SOFT: http://BillieEilish.lnk.to/HITMEHARDANDSOFT Get tickets: ...",
    "tempo": "5:24",
    "views": 88208866,
    "id": "BY_XwvKogC8",
    "audio": "https://ytdl.vreden.web.id/database/file?id=aHR0cHM6Ly9hcGkuYXBpYXBpLmxhdC9kODNlZTUxNzIyNWQwYWMzY2JhMzQ3MzI0N2ZhZDg3Ny9kb3dubG9hZC9nZDU4ZTIxMSUyQ2cyZzclMkM1NTQlNjAlMkM4NGdiJTJDZDM0OGNnN2Q1MzUzLzYzZGVhMTRhMWU2N2Y1MjQ5MzUzMTAyOTUyODY5YTQ4Lw=="
  }
}
*/
//https://carisys.online/api/downloads/youtube/play_audio?query=mtg%20do%20job
module.exports = {
    name: 'play',
    description: 'Baixa áudio do YouTube',
    commands: ['play'],
    usage: `${PREFIX}play <nome da música ou link>`,
    handle: async ({
        args,
        sendReact,
        sendReply,
        sendWaitReact,
        sendSuccessReact,
        sendImageFromURL,
        sendAudioFromURL,
    }) => {
        if (!args || args.length === 0) {
            await sendReact('❓');
            return await sendReply('Onde está o nome da música?');
        }

        let musicName = args.join(' ');
        musicName = encodeURIComponent(musicName);


        try {
            await sendWaitReact();
            const api = await axios.get(`https://carisys.online/api/downloads/youtube/play?query=${musicName}`);

            if (!api.data.status) {
                await sendReact('❌');
                return await sendReply('Música não encontrada.');
            }

            const res = api.data.resultado;
            console.log(res);
            await sendSuccessReact();
            await sendImageFromURL(res.imagem,
                `${res.titulo} 
Descrição: ${res.desc}
Duração: ${res.tempo}
`);

            await sendAudioFromURL(res.audio);
            console.log("audio enviado");

            /*
            const outputPath = path.resolve(
                TEMP_DIR,
                `${getRandomNumber(10_000, 99_999)}.mp3`
            );
*/

        } catch (error) {
            console.error('Erro ao baixar o áudio:', error);
            await sendReact('❌');
            await sendReply('Erro ao baixar o áudio.');
        }
    },

}
