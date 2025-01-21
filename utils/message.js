const status = {

    /* ---- 200 ---- */
    "OK": {
        "message" : "요청이 성공적으로 처리되었습니다."
    },
    /* ---- 201 ---- */
    "CREATED_USER": {
        "message" : "사용자가 성공적으로 등록되었습니다."
    },
    "CREATED_IMAGE": {
        "message" : "이미지가 성공적으로 등록되었습니다."
    },
    "CREATED_POST": {
        "message" : "게시글이 성공적으로 등록되었습니다."
    },
    "CREATED_COMMENT": {
        "message" : "댓글이 성공적으로 등록되었습니다."
    },
    "CREATED_POST_THUMBS_UP": {
        "message" : "게시글 좋아요가 성공적으로 등록되었습니다."
    },
    "CREATED_PRE_SIGNED_URL": {
        "message" : "PreSignedURL이 성공적으로 생성되었습니다."
    },

    /* ---- 400 ---- */
    "BAD_REQUEST": {
        "message" : "잘못된 요청입니다. 입력값을 확인해주세요."
    },
    "BAD_REQUEST_EMAIL": {
        "message" : "이메일 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_PASSWORD": {
        "message" : "비밀번호 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_SECRET_KEY": {
        "message" : "시크릿 키 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_NICKNAME": {
        "message" : "닉네임 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_IMAGE_URL": {
        "message" : "이미지 URL 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_IMAGE": {
        "message" : "잘못된 요청입니다. 이미지 파일을 확인해주세요."
    },
    "BAD_REQUEST_POST_TITLE": {
        "message" : "게시글 제목 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_POST_CONTENT": {
        "message" : "게시글 내용 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_COMMENT_CONTENT": {
        "message" : "댓글 내용 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_OFFSET_LIMIT": {
        "message" : "offset/limit 유효성 검증에 실패했습니다."
    },
    "BAD_REQUEST_ID": {
        "message" : "ID 유효성 검증에 실패했습니다."
    },

    /* ---- 401 ---- */
    "UNAUTHORIZED": {
        "message" : "인증되지 않은 사용자입니다."
    },
    /* ---- 403 ---- */
    "FORBIDDEN_POST": {
        "message" : "해당 게시글에 접근 권한이 없습니다."
    },
    "FORBIDDEN_COMMENT": {
        "message" : "해당 댓글에 접근 권한이 없습니다."
    },
    /* ---- 404 ---- */
    "NOT_FOUND_USER": {
        "message" : "해당 유저가 존재하지 않습니다."
    },
    "NOT_FOUND_POST": {
        "message" : "해당 게시글이 존재하지 않습니다."
    },
    "NOT_FOUND_COMMENT": {
        "message" : "해당 댓글이 존재하지 않습니다."
    },
    "NOT_FOUND_POST_THUMBS": {
        "message" : "해당 게시글 좋아요가 존재하지 않습니다."
    },
    /* ---- 409 ---- */
    "CONFLICT_EMAIL": {
        "message" : "이미 존재하는 이메일입니다."
    },
    "CONFLICT_NICKNAME": {
        "message" : "이미 존재하는 닉네임입니다."
    },
    "CONFLICT_POST_THUMBS": {
        "message" : "이미 존재하는 게시글 좋아요입니다."
    },

    /* ---- 500 ---- */
    "INTERNAL_SERVER_ERROR": {
        "message" : "일시적인 오류가 발생했습니다."
    },
    "INTERNAL_SERVER_ERROR_SESSION_DESTROY": {
        "message" : "일시적인 오류가 발생했습니다."
    },
}

module.exports = status