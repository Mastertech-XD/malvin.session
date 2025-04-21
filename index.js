const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;
const __path = process.cwd();

// Routes
const qrRoute = require('./qr');
const pairRoute = require('./pair');

// Increase event listeners limit
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__path, 'public')));

// Routes
app.use('/qr', qrRoute);
app.use('/code', pairRoute);

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════╗
║   MASTERTECH-MD SESSION SERVER   ║
║      Created by Masterpeace      ║
║      Running on port ${PORT}      ║
╚══════════════════════════════════╝
`);
});

module.exports = app;
