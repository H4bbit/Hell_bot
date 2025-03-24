const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    isJidBroadcast,
    isJidStatusBroadcast,
    isJidNewsletter,
    proto,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const path = require('path');
const pino = require('pino');
const { question, onlyNumbers } = require('./utils');
const { getMessages, clearMessages } = require('./utils/database');
const { BOT_NUMBER } = require('./config');
const { load } = require("./loader");

const logger = require("./utils/logger");

const NodeCache = require("node-cache");
const msgRetryCounterCache = new NodeCache();

const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
    let message = getMessages(key.remoteJid, key.id)
    if (message) {
        return proto.Message.fromObject(message)
    }
    return proto.Message.fromObject({})
}

const patchInteractiveMessage = message => {
    return message?.interactiveMessage
        ? {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadataVersion: 2,
                        deviceListMetadata: {},
                    },
                    ...message,
                },
            },
        }
        : message;
};

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, '..', 'assets', 'auth', 'baileys'));

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA  version: ${version.join('.')}, isLatest: ${isLatest}`);
    const socket = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        cachedGroupMetadata: async jid => groupCache.get(jid),
        getMessage,
        patchMessageBeforeSending: patchInteractiveMessage,
        msgRetryCounterCache,
        syncFullHistory: true,
        printQRInTerminal: false,
        defaultQueryTimeoutMs: 60 * 1000,
        keepAliveIntervalMs: 60 * 1000,
        markOnlineOnConnect: true,
        shouldSyncHistoryMessage: () => false,
        shouldIgnoreJid: (jid) =>
            isJidBroadcast(jid)
            || isJidStatusBroadcast(jid)
            || isJidNewsletter(jid),
    });
    store.bind(socket.ev)
    //se não tiver credenciais, solicita
    if (!socket.authState.creds.registered) {
        console.log("Credenciais ainda não configuradas!");
        console.log('Informe o número de telefone do bot (exemplo: "5511920202020"):');
        const phoneNumber = BOT_NUMBER;//await question('numero de telefone: ');
        if (!phoneNumber) {
            throw new Error('numero invalido');
        }
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        logger.info(`codigo de pareamento: ${code}`);
    }

    //limpa mensagens armazenadas na sessao anterior
    clearMessages();

    //para cada atualização de conexão, verifica se houve erro e qual foi
    socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode =
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (statusCode === DisconnectReason.loggedOut) {
                logger.warn('bot desconectado. apague a sessao');

            } else {
                switch (statusCode) {
                    case DisconnectReason.badSession:
                        logger.warn("Sessão inválida!");
                        break;
                    case DisconnectReason.connectionClosed:
                        logger.warn("Conexão fechada!");
                        break;
                    case DisconnectReason.connectionLost:
                        logger.warn("Conexão perdida!");
                        break;
                    case DisconnectReason.connectionReplaced:
                        logger.warn("Conexão substituída!");
                        break;
                    case DisconnectReason.multideviceMismatch:
                        logger.warn("Dispositivo incompatível!");
                        break;
                    case DisconnectReason.forbidden:
                        logger.warn("Conexão proibida!");
                        break;
                    case DisconnectReason.restartRequired:
                        infoLog('Me reinicie por favor! Digite "npm start".');
                        break;
                    case DisconnectReason.unavailableService:
                        logger.warn("Serviço indisponível!");
                        break;
                }
                const newSocket = await connect();
                load(newSocket);

            }
        } else if (connection === 'open') {
            logger.info('🟢 conectado');
            socket.sendMessage(
                BOT_NUMBER + "@s.whatsapp.net",
                {
                    text: "🟢 bot online"
                }
            );
        } else {
            logger.info('atualizando conexão...');
        }
    });
    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('groups.update', async (groups) => {
        const metadata = await socket.groupMetadata(groups.id)
        groupCache.set(groups.id, metadata)
    });
    return socket;
};
exports.connect = connect;
