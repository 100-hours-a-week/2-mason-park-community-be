const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    // 저장 경로
    destination: (req, file, cb) => {
        cb(null, process.env.DB_PATH_PROFILE_IMAGE);
    },
    // 파일명
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})

const uploader = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // bytes
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = process.env.ALLOWED_FILE_EXTENSIONS.split(',');
        const extension = path.extname(file.originalname).toLowerCase();

        // JSON 파일은 항상 허용
        if (file.mimetype === 'application/json') {
            cb(null, true);
            return;
        }

        // 확장자가 허용된 목록에 있는지 확인
        if (allowedExtensions.includes(extension)) {
            cb(null, true); // 통과
        } else {
            cb(new ValidationError('허용되지 않은 파일 형식입니다.'), false); // 거부
        }
    }
})

module.exports = uploader;