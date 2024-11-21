const fs = require('fs/promises');
const ENCODING_FORMAT = 'utf-8';

exports.readDB = async (path) => {
    const data = await fs.readFile(path, ENCODING_FORMAT)

    return JSON.parse(data);
}

exports.writeDB = async (path, data) => {
   await fs.writeFile(path, JSON.stringify(data, null, 2), ENCODING_FORMAT);
}

