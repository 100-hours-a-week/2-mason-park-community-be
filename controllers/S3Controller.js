const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const response = require("../utils/response");
const status = require("../utils/message");

const S3 = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_ACCESS_SECRET,
    }

})

exports.createPreSignedUrl = async (req, res, next) => {
    const {filename, path} = req.body;
    const file = filename.split('.'); // 파일명과 확장자 분리

    // 파일 이름 충돌 방지: 버킷 내 경로/파일명-UUID.확장자
    const key = `${path}/${file[0]}-${uuidv4()}.${file[1]}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET, // 파일을 업로드할 대상 버킷
        Key: key, // 업로드할 파일 이름
    })

    // pre-signed URL 발급
    const preSignedUrl = await getSignedUrl(S3, command, {expiresIn: 180});

    return res
        .status(201)
        .json(response.base(status.CREATED_PRE_SIGNED_URL.message, {preSignedUrl, key}));
}


