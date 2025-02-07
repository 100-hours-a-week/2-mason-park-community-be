exports.validateEmail = email => {
    // 대소문자 / 숫자 / @ / . / _ / - 포함 가능
    return /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i.test(email);
}

exports.validateNickname = nickname => {
    // 닉네임은 1자 이상 / 10자 이하 / 공백 X
    return /^[^\s]{1,10}$/.test(nickname);
}

exports.validatePassword = password => {
    // 비밀번호는 8자 이상 / 20자 이하 / 대소문자, 숫자, 특수문자를 각각 최소 1개 포함
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]{8,20}$/.test(password);
}

exports.validatePostTitle = title => {
    const len = title.length;
    return 0 < len && len <= 26;
}

exports.validatePostContent = content => {
    const len = content.length;
    return 0 < len && len <= 1500;
}

exports.validateId = id => {
    return Number(id) && id > 0;
}