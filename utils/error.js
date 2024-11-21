class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name; // 에러 이름 설정 (클래스 이름)
        this.statusCode = statusCode || 500; // 상태 코드 (기본값 500)
    }
}

class ValidationError extends CustomError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

class ForbiddenError extends CustomError {
    constructor(message = 'Forbidden access') {
        super(message, 403);
    }
}

class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ConflictError extends CustomError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}

class InternalServerError extends CustomError {
    constructor(message = 'Internal Server Error') {
        super(message, 500);
    }
}
