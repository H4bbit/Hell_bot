const { PREFIX, TEMP_DIR, BOT_NAME } = require('../../config');
const path = require("path");
const fs = require("fs");
const { getRandomNumber } = require(`../../utils`);
const ffmpeg = require('fluent-ffmpeg');
const {
    InvalidParameterError,
} = require(`../../errors`);
const { adicionarExif } = require('../../utils/metadataWebp');

module.exports = {
    name: 'sticker',
    description: "Faço figurinhas de imagem/gif/vídeo",
    commands: ["s", "sticker", "fig", "f"],
    usage: `${PREFIX}sticker (marque a imagem/gif/vídeo) ou ${PREFIX}sticker (responda a imagem/gif/vídeo)`,
    handle: async ({
        isImage,
        isVideo,
        downloadImage,
        downloadVideo,
        webMessage,
        sendErrorReply,
        sendSuccessReact,
        sendWaitReact,
        sendStickerFromBuffer,
    }) => {
        try {
            console.log(JSON.stringify(webMessage.message));
            if (!isImage && !isVideo) {
                throw new InvalidParameterError(
                    "Você precisa marcar uma imagem/gif/vídeo ou responder a uma imagem/gif/vídeo"
                );
            }

            await sendWaitReact();

            const outputPath = path.resolve(
                TEMP_DIR,
                `${getRandomNumber(10_000, 99_999)}.webp`
            );

            if (isImage) {
                console.log(webMessage.pushName, BOT_NAME);
                const inputPath = await downloadImage(webMessage, "input");
                ffmpeg(inputPath)
                    .outputOptions('-vf', 'scale=512:512')
                    .save(outputPath)
                    .on('end', async () => {
                        //add metadata to sticker image 
                        const buffer = await fs.promises.readFile(outputPath);

                        // pack sticker name is bot name and author is user name 
                        const stickerWithExif = await adicionarExif(buffer,
                            /*
                             𐙞 Hell’s Temptation  き⃟😈
⤷ 𝑏𝑜𝑡 𝑏𝑦 S3NP41 𐙞 𝖥𝖾it𝖺 𝗉𝗈𝗋 き⃟🩸
⤷ ⋅ 𝒮𝒾𝓃𝒻𝓊𝓁 𝒮𝑜𝓊𝓁 ⋅
                            */
                            BOT_NAME + "\n⤷ 𝑏𝑜𝑡 𝑏𝑦 S3NP41", "𐙞 𝖥𝖾it𝖺 𝗉𝗈𝗋 き⃟🩸\n ⤷ ⋅" + webMessage.pushName);

                        if (!stickerWithExif) {
                            console.log("Error adding metadata");
                        }
                        await sendSuccessReact();
                        fs.writeFileSync(outputPath, stickerWithExif);
                        await sendStickerFromBuffer(stickerWithExif);
                    })
                    .on('error', (error) => {
                        console.log(error);
                        fs.unlinkSync(inputPath);
                        throw new Error(error);
                    });
            } else {
                const inputPath = await downloadVideo(webMessage, "input");

                const sizeInSeconds = 10;

                const seconds =
                    webMessage.message?.videoMessage?.seconds ||
                    webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
                        ?.videoMessage?.seconds;

                const haveSecondsRule = seconds <= sizeInSeconds;

                if (!haveSecondsRule) {
                    fs.unlinkSync(inputPath);

                    await sendErrorReply(`O vídeo que você enviou tem mais de ${sizeInSeconds} segundos!

Envie um vídeo menor!`);

                    return;
                }
                ffmpeg(inputPath)
                    .on('start', (cmd) => {
                        console.log(cmd);
                    })
                    .outputOptions(
                        '-y', '-vcodec', 'libwebp', '-fs', '0.99M', '-filter_complex', '[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse', '-f', 'webp')
                    .save(outputPath)
                    .on('end', async () => {
                        //add metadata to sticker image 
                        const buffer = await fs.promises.readFile(outputPath);

                        // pack sticker name is bot name and author is user name 
                        const newBuffer = await adicionarExif(buffer,
                            BOT_NAME, webMessage.pushName);
                        await sendSuccessReact();
                        fs.writeFileSync(outputPath, newBuffer);
                        await sendStickerFromBuffer(newBuffer);
                    })
                    .on('error', (error) => {
                        console.log(error);
                        fs.unlinkSync(inputPath);
                        throw new Error(error);
                    });
            }
        } catch (error) {
            console.error(error);
            await sendErrorReply(error);
        }

    },
}
