const path = require('path');
const functions = require('../utils/functions');

const PATH = path.join(__dirname, process.env.DB_PATH_USER);

function User (id, email, password, nickname, profile_image) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.nickname = nickname;
    this.profile_image = profile_image;
}

exports.findUserByEmail = (email) => {
    const users = functions.readDB(PATH);

    return users.find((user) => user.email === email);
};

exports.save = (email, password, nickname, profile_image) => {
    const users = functions.readDB(PATH);

    const user = new User(
        users.length + 1,
        email,
        password,
        nickname,
        profile_image
    );

    users.push(user);
    functions.writeDB(PATH, users);

    return user;
}

exports.existsEmail = (email) => {
    const users = functions.readDB(PATH);

    return users.findIndex((user) => user.email === email) !== -1;
}

exports.existsNickname = (nickname) => {
    const users = functions.readDB(PATH);

    return users.findIndex((user) => user.nickname === nickname) !== -1;
}