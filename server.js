const dotenv = require('dotenv');
dotenv.config();

if (process.env.NODE_ENV === 'production') {
    require('dotenv').config({ path: `./config/.env`});
}

const app = require('./app');

const PORT = process.env.PORT || 8080;
let isKeepAlive = false;

app.listen(PORT, () => {
    isKeepAlive = true;
    if (process.send) {
        process.send('ready');
    }
    console.log(`API Server is running on port ${PORT}`);
})

process.on('SIGINT', () => {
    app.close(() => {
        console.log('server closed');
        if (process.exit) {
            process.exit(0);
        }
    })
})