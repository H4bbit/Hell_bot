const { PREFIX, TEMP_DIR } = require('../../config');
const ffmpeg = require('fluent-ffmpeg');
const path = require("path");
const { getRandomNumber } = require(`../../utils`);
const fs = require('fs');

module.exports = {
    name: 'toimg',
    description: 'converte figurinha em imagem',
    commands: ['toimg', 'figtoimg'],
    usage: `${PREFIX}toimg`,

    handle: async ({
        webMessage,
        isSticker,
        sendWaitReact,
        sendSuccessReact,
        downloadSticker,
        sendImageFromFile,
    }) => {
        if (!isSticker) {
            throw new Error("Você precisa marcar uma figurinha");
        }
        await sendWaitReact();

        const inputPath = await downloadSticker(webMessage, "input");
        const outputPath = path.resolve(TEMP_DIR, `${getRandomNumber(10000, 99999)}.png`);

        ffmpeg(inputPath)
            .output(outputPath)
            .on('end', async () => {
                await sendSuccessReact();
                await sendImageFromFile(outputPath);
                fs.unlinkSync(outputPath);
                fs.unlinkSync(inputPath);
            })
            .on('error', (error) => {
                console.log(error);
                fs.unlinkSync(outputPath);
                fs.unlinkSync(inputPath);
                throw new Error(error);
            })
            .run();
    },
}
