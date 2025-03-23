const path = require("path");
const fs = require("fs");
const databasePath = path.resolve(__dirname, "..", "..", "database");
const Datastore = require('@seald-io/nedb');

const db = new Datastore({
    filename: path.join(databasePath, 'messages.db'),
    autoload: true
});

//armazenar mensagens 
exports.storeMessages = (chatId, messageId, message) => {
    const data = {
        chatId,
        messageId,
        message: JSON.stringify(message),
        timesTamp: Date.now(),
    };
    return new Promise((resolve, reject) => {
        db.insert(data, (err, newDoc) => {
            if (err) {
                console.error('Erro ao inserir mensagem:', err);
                reject(err);
            } else {
                resolve(newDoc);
            }
        });
    });
}

//obter mensagens
exports.getMessages = (chatId, messageId) => {
    return new Promise((resolve, reject) => {
        db.findOne({ chatId, messageId }, (err, doc) => {
            if (err) {
                console.error('Erro ao obter mensagem:', err);
                reject(err);
            } else {
                resolve(doc);
            }
        });
    });
}

/*
//apagar mensagens
export function deleteMessages(chatId) {
    return new Promise((resolve, reject) => {
        db.remove({ chatId: chatId }, { multi: true }, (err, numRemoved) => {
            if (err) {
                console.error('Erro ao apagar mensagens:', err);
                reject(err);
            } else {
                resolve(numRemoved);
            }
        });
    });
}
*/

// Função auxiliar para criar o arquivo se não existir
function createIfNotExists(fullPath) {
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, JSON.stringify({}));
    }
}

// Função para ler o conteúdo de um arquivo JSON
function readJSON(jsonFile) {
    const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
    createIfNotExists(fullPath);
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

// Função para escrever dados em um arquivo JSON
function writeJSON(jsonFile, data) {
    const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
    createIfNotExists(fullPath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}
/*
// Função para salvar a assinatura do usuário
exports.saveUserSignature = (userJid, autor, pack) => {
    const filename = "user-signatures";
    const signatures = readJSON(filename);
    signatures[userJid] = { autor, pack };
    writeJSON(filename, signatures);
};

// Função para obter a assinatura do usuário
exports.getUserSignature = (userJid) => {
    const filename = "user-signatures";
    const signatures = readJSON(filename);
    return signatures[userJid] || null;
};
*/
const USER_MARKS_FILE = "user-marks";

// Lê ou cria o arquivo de registro de marcas
function readUserMarks() {
    const fullPath = path.resolve(databasePath, `${USER_MARKS_FILE}.json`);
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

// Salva as marcas dos usuários
function writeUserMarks(data) {
    const fullPath = path.resolve(databasePath, `${USER_MARKS_FILE}.json`);
    fs.writeFileSync(fullPath, JSON.stringify(data));
}

exports.saveUserMark = (userJid, autor, pack) => {
    const userMarks = readUserMarks();
    userMarks[userJid] = { autor, pack };
    writeUserMarks(userMarks);
};

exports.getUserMark = (userJid) => {
    const userMarks = readUserMarks();
    return userMarks[userJid] || null;
};
// Funções existentes
exports.activateGroup = (groupId) => {
    const filename = "inactive-groups";
    const inactiveGroups = readJSON(filename);
    const index = inactiveGroups.indexOf(groupId);
    if (index !== -1) {
        inactiveGroups.splice(index, 1);
        writeJSON(filename, inactiveGroups);
    }
};

exports.deactivateGroup = (groupId) => {
    const filename = "inactive-groups";
    const inactiveGroups = readJSON(filename);
    if (!inactiveGroups.includes(groupId)) {
        inactiveGroups.push(groupId);
    }
    writeJSON(filename, inactiveGroups);
};

exports.isActiveGroup = (groupId) => {
    const filename = "inactive-groups";
    const inactiveGroups = readJSON(filename);
    return !inactiveGroups.includes(groupId);
};
