const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: Mastertech,
    useMultiFileAuthState,
    delay
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function MASTERTECH_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let MastertechBot = Mastertech({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Mastertech-MD", "Desktop", "1.0.0"]
            });

            MastertechBot.ev.on('creds.update', saveCreds);
            MastertechBot.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    try {
                        const qrBuffer = await QRCode.toBuffer(qr);
                        if (!res.headersSent) {
                            res.setHeader('Content-Type', 'image/png');
                            return res.end(qrBuffer);
                        }
                    } catch (qrErr) {
                        console.error("QR generation error:", qrErr);
                    }
                }
                
                if (connection === "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    
                    let session = await MastertechBot.sendMessage(MastertechBot.user.id, { text: b64data });

                    const MASTERTECH_TEXT = `
┏━━━━━━━━━━━━━━
┃MASTERTECH-MD SESSION 
┃SUCCESSFULLY CONNECTED ✅
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❶ || Creator: Masterpeace Elite
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❷ || Channel: https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❸ || Contact: https://wa.me/254743727510
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❹ || GitHub: https://github.com/mastertech-md
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
© ${new Date().getFullYear()} Masterpeace Elite`;

                    await MastertechBot.sendMessage(
                        MastertechBot.user.id,
                        { text: MASTERTECH_TEXT },
                        { quoted: session }
                    );

                    await delay(100);
                    await MastertechBot.ws.close();
                    return removeFile('./temp/' + id);
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== 401
                ) {
                    await delay(10000);
                    MASTERTECH_MD_QR_CODE();
                }
            });
        } catch (err) {
            console.error("QR session error:", err);
            removeFile('./temp/' + id);
            
            if (!res.headersSent) {
                return res.status(500).json({ 
                    error: "QR service unavailable",
                    message: "Please try again later"
                });
            }
        }
    }

    return MASTERTECH_MD_QR_CODE();
});

module.exports = router;
