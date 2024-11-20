const path = require('path');
const functions = require('../utils/functions');

const PATH = path.join(__dirname, process.env.DB_PATH_USER);

function User (user_id, email, password, nickname, profile_image) {
    this.user_id = user_id;
    this.email = email;
    this.password = password;
    this.nickname = nickname;
    this.profile_image = profile_image;
}

exports.findByEmail = (email) => {
    const users = functions.readDB(PATH);

    return users.find((user) => String(user.email) === String(email));
};

exports.findById = (userId) => {
    const users = functions.readDB(PATH);

    return users.find((user) => String(user.user_id) === String(userId));
}

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

exports.update = (userId, profile_image, nickname) => {
    const users = functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    users[targetIdx] = {
        ...users[targetIdx],
        profile_image: profile_image ? profile_image : users[targetIdx].profile_image,
        nickname: nickname ? nickname : users[targetIdx].nickname,
    };

    functions.writeDB(PATH, users);

    return users[targetIdx];
}

exports.updatePassword = (userId, password) => {
    const users = functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    users[targetIdx] = {
        ...users[targetIdx],
        password: password ? password : users[targetIdx].password,
    };

    functions.writeDB(PATH, users);

    return users[targetIdx];
}

exports.delete = (userId) => {
    const users = functions.readDB(PATH);

    const targetIdx = users.findIndex((user) => String(user.user_id) === String(userId));

    // 회원 삭제
    users.splice(targetIdx, 1);

    functions.writeDB(PATH, users);
}

exports.existsEmail = (email) => {
    const users = functions.readDB(PATH);

    return users.findIndex((user) => user.email === email) !== -1;
}

exports.existsNickname = (nickname) => {
    const users = functions.readDB(PATH);

    return users.findIndex((user) => user.nickname === nickname) !== -1;
}