const status = {

    /* ---- 200 ---- */
    "OK": {
        "message" : "요청이 성공적으로 처리되었습니다."
    },
    "CREATED_USER": {
        "message" : "사용자가 성공적으로 등록되었습니다."
    },

    /* ---- 400 ---- */
    "BAD_REQUEST": {
        "message" : "잘못된 요청입니다. 입력값을 확인해주세요."
    },
    "UNAUTHORIZED": {
        "message" : "인증되지 않은 사용자입니다."
    },
    "NOT_FOUND_USER": {
        "message" : "해당 유저가 존재하지 않습니다."
    },
    "CONFLICT_EMAIL": {
        "message" : "이미 존재하는 이메일입니다."
    },
    "CONFLICT_NICKNAME": {
        "message" : "이미 존재하는 닉네임입니다."
    },

    /* ---- 500 ---- */
    "INTERNAL_SERVER_ERROR": {
        "message" : "일시적인 오류가 발생했습니다."
    },
}

module.exports = status