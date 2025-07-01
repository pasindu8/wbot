const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const authFolder = path.join(__dirname, '..', 'sessions');

let sock;

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('📱 Scan this QR Code:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔌 Disconnected. Trying to reconnect...', shouldReconnect);
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connected!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message?.conversation) {
            console.log('📩 Message from', msg.key.remoteJid, ':', msg.message.conversation);

            // 👉 Optional: Forward to webhook using axios here
        }
    });

    global.sock = sock;
}

module.exports = { startSock };
