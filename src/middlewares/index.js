const { PREFIX, OWNER_NUMBER } = require("../config");
const { toUserJid } = require("../utils");

exports.verifyPrefix = (prefix) => PREFIX === prefix;
exports.hasTypeOrCommand = ({ type, command }) => type && command;

/*
exports.isAdmin = async ({ remoteJid, userJid, socket }) => {
  const { participants, owner } = await socket.groupMetadata(remoteJid);

  const participant = participants.find(
    (participant) => participant.id === userJid
  );

  if (!participant) {
    return false;
  }

  const isOwner =
    participant.id === owner ||
    participant.admin === "superadmin" ||
    participant.id === toUserJid(OWNER_NUMBER);

  const isAdmin = participant.admin === "admin";

  return isOwner || isAdmin;
};
*/

