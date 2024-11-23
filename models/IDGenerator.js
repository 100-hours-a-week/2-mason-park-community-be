const path = require('path');
const PATH = path.join(__dirname, process.env.DB_PATH_ID);
const fs = require('fs');

// ID 상태 불러오기
const loadIdState = () => {
    if (!fs.existsSync(PATH)) {
        // 파일이 없으면 초기화
        fs.writeFileSync(PATH, JSON.stringify({}), 'utf8');
    }
    const fileContent = fs.readFileSync(PATH, 'utf8');
    return JSON.parse(fileContent);
}

// ID 상태 저장
const saveIdState = (state) => {
    fs.writeFileSync(PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ID 생성기
exports.generateId = (tableName) => {
    const state = loadIdState();

    // 테이블 이름이 없으면 초기화
    if (!state[tableName]) {
        state[tableName] = 0;
    }

    // ID 증가 및 저장
    state[tableName] += 1;
    saveIdState(state);

    return state[tableName];
}
