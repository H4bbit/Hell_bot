const { PREFIX, TEMP_DIR } = require('../../config');
const ffmpeg = require('fluent-ffmpeg');
const path = require("path");
const { getRandomNumber } = require(`../../utils`);
const fs = require('fs');

module.exports = {
    name: 'tovideo',
    description: 'converte figurinha em video',
    commands: ['tovideo', 'figtovideo'],
    usage: `${PREFIX}tovideo`,

    handle: async ({
        webMessage,
        isSticker,
        sendWaitReact,
        sendSuccessReact,
        downloadSticker,
        sendVideoFromFile,
    }) => {
        if (!isSticker) {
            throw new Error("Você precisa marcar uma figurinha");
        }
        await sendWaitReact();

        //        console.log(JSON.stringify(webMessage.message));
        const inputPath = await downloadSticker(webMessage, "input");
        const outputPath = path.resolve(TEMP_DIR, `${getRandomNumber(10000, 99999)}.mp4`);

        if (!fs.existsSync(inputPath)) {
            throw new Error("Erro ao baixar figurinha");
        }
        //convert webp animated to mp4 video
        ffmpeg(inputPath)
            .output(outputPath)
            .outputOptions([
                '-c:v libx264',
                '-pix_fmt yuv420p',
            ])
            .on('end', async () => {
                await sendSuccessReact();
                await sendVideoFromFile(outputPath);

                if (fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            })
            .on('error', (error) => {
                console.log(error);
                fs.unlinkSync(inputPath);
                throw new Error(error);
            })
            .run();
        /*
                ffmpeg(inputPath)
                    .output(outputPath)
                    .outputOptions([
                        '-c:v libx264',
                        '-pix_fmt yuv420p',
                        '-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"'
                    ])
                    .on('end', async () => {
                        await sendSuccessReact();
                        await sendVideoFromFile(outputPath);
                    })
                    .on('error', (error) => {
                        console.log(error);
                        throw new Error(error);
                    })
                    .run();
        */
    }

}
