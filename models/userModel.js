const path = require('path');
const functions = require('../utils/functions');
const moment = require('moment');
const {generateId} = require("./IDGenerator");
const PATH = path.join(__dirname, process.env.DB_PATH_USER);

function User (user_id, email, password, nickname, profile_image, created_at, modified_at) {
    this.user_id = user_id;
    this.email = email;
    this.password = password;
    this.nickname = nickname;
    this.profile_image = profile_image;
    this.created_at = created_at;
    this.modified_at = modified_at;
}

exports.findByEmail = async (email) => {
    const users = await functions.readDB(PATH);

    return users.find((user) => String(user.email) === String(email));
};

exports.findById = async (userId) => {
    const users = await functions.readDB(PATH);

    return users.find((user) => String(user.user_id) === String(userId));
}

exports.save = async (email, password, nickname, profile_image) => {
    const users = await functions.readDB(PATH);

    const user = new User(
        generateId('users'),
        email,
        password,
        nickname,
        profile_image,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss'),
    );

    users.push(user);
    await functions.writeDB(PATH, users);

    return user;
}

exports.update = async (userId, profile_image, nickname) => {
    const users = await functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    users[targetIdx] = {
        ...users[targetIdx],
        profile_image: profile_image ? profile_image : users[targetIdx].profile_image,
        nickname: nickname ? nickname : users[targetIdx].nickname,
        modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await functions.writeDB(PATH, users);

    return users[targetIdx];
}

exports.updatePassword = async (userId, password) => {
    const users = await functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    users[targetIdx] = {
        ...users[targetIdx],
        password: password ? password : users[targetIdx].password,
        modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await functions.writeDB(PATH, users);

    return users[targetIdx];
}

exports.deleteById = async (userId) => {
    const users = functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    // 회원 삭제
    users.splice(targetIdx, 1);

    await functions.writeDB(PATH, users);
}

exports.existsEmail = async (email) => {
    const users = await functions.readDB(PATH);

    return users.findIndex((user) => user.email === email) !== -1;
}

exports.existsNickname = async (nickname) => {
    const users = await functions.readDB(PATH);

    return users.findIndex((user) => user.nickname === nickname) !== -1;
}