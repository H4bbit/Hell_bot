const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const path = require('path');
const readline = require('readline');
const { buffer } = require('stream/consumers');
const { PREFIX, TEMP_DIR, COMMANDS_DIR } = require('../config');
const { writeFile } = require('fs/promises');
const fs = require('fs');

exports.question = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => rl.question(message, resolve));
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomNumber = getRandomNumber;

const onlyNumbers = (text) => text.replace(/[^0-9]/g, "");

exports.onlyNumbers = onlyNumbers;

exports.toUserJid = (number) => `${onlyNumbers(number)}@s.whatsapp.net`;

exports.extractDataFromMessage = (webMessage) => {
    const textMessage = webMessage.message?.conversation;
    const extendedTextMessage = webMessage.message?.extendedTextMessage;
    const extendedTextMessageText = extendedTextMessage?.text;
    const imageTextMessage = webMessage.message?.imageMessage?.caption;
    const videoTextMessage = webMessage.message?.videoMessage?.caption;

    const fullMessage =
        textMessage ||
        extendedTextMessageText ||
        imageTextMessage ||
        videoTextMessage;

  if (!fullMessage) {
    return {
      args: [],
      commandName: null,
      fullArgs: null,
      fullMessage: null,
      isReply: false,
      prefix: null,
      remoteJid: null,
      replyJid: null,
      userJid: null,
    };
  }
    //    console.log(fullMessage);

    const isReply =
        !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

    const replyJid =
        !!extendedTextMessage &&
            !!extendedTextMessage.contextInfo?.participant
            ? extendedTextMessage.contextInfo.participant
            : null;

    const userJid = webMessage?.key?.participant?.replace(
        /:[0-9][0-9]|:[0-9]/g, ""
    );

    const [command, ...args] = fullMessage.split(" ");
    const prefix = command.charAt(0);
    const commandWithoutPrefix = command.replace(new RegExp(`^[${PREFIX}]+`), "");
    return {
        remoteJid: webMessage?.key?.remoteJid,
        prefix,
        userJid,
        replyJid,
        isReply,
        fullArgs: args.join(" "),
        commandName: this.formatCommand(commandWithoutPrefix),
        args: this.splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    };

};


exports.splitByCharacters = (str, characters) => {
    characters =
        characters.map(
            //limpa caracteres especiais
            (char) => (char === "\\" ? "\\\\" : char));
    const regex = new RegExp(`[${characters.join("")}]`);
    return str.split(regex)
        .map((str) => str.trim())
        .filter(Boolean);

};
exports.onlyLettersAndNumbers = (text) => {
    return text.replace(/[^a-zA-Z0-9]/g, "");

};
//os comandos do bot sao insensiveis a maiusculos 
exports.formatCommand = (text) => {
    if (!text) return "";
    return this.onlyLettersAndNumbers(
        this.removeAccentAndSpecialCharacters(
            text.toLowerCase().trim())
    );
};

exports.removeAccentAndSpecialCharacters = (text) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
    return !!this.getContent(webMessage, context);

};

exports.getContent = (webMessage, context) => {
    return (
        webMessage.message?.[`${context}Message`] ||
        webMessage.message?.extendedTextMessage?.
            contextInfo?.quotedMessage?.[
        `${context}Message`
        ]
    );
};
exports.download = async (webMessage, fileName, context, extension) => {

    const content = this.getContent(webMessage, context);

    if (!content) {
        return null;
    }

    const stream = await downloadContentFromMessage(content, context);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);

    await writeFile(filePath, buffer);

    return filePath;
};

exports.findCommandImport = (commandName) => {
    const command = this.readCommandImports();

    let typeReturn = "";
    let targetCommandReturn = null;

    for (const [type, commands] of Object.entries(command)) {
        if (!commands.length) {
            continue;
        }

        const targetCommand = commands.find(
            cmd => cmd.commands.map(this.formatCommand).includes(this.formatCommand(commandName)));

        if (targetCommand) {
            typeReturn = type;
            targetCommandReturn = targetCommand;
            break;
        }
    }
    return {
        type: typeReturn,
        command: targetCommandReturn
    };
};

exports.readCommandImports = () => {
    const subdirectories = fs.readdirSync(COMMANDS_DIR, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name);

    const commandImports = {};

    for (const subdir of subdirectories) {
        const subdirectoryPath = path.join(COMMANDS_DIR, subdir);
        const files = fs.readdirSync(subdirectoryPath)
            .filter((file) =>
                !file.startsWith('_') && file.endsWith('.js')
            ).map(file =>
                require(path.join(subdirectoryPath, file)));

        commandImports[subdir] = files;
    }
    return commandImports;

};

