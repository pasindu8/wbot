const express = require('express');
const router = express.Router();

router.post('/sendMessage', async (req, res) => {
    const { to, message } = req.body;

    if (!global.sock) return res.status(500).send('WhatsApp not ready');

    try {
        await global.sock.sendMessage(to + '@s.whatsapp.net', { text: message });
        res.send({ success: true, message: 'Sent successfully' });
    } catch (e) {
        res.status(500).send({ success: false, error: e.message });
    }
});

module.exports = router;
