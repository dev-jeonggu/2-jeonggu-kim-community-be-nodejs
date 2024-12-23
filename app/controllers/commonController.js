const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const sharp = require("sharp");

// NOTE :S3 및 CloudFront 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION, // NOTE :S3 버킷의 리전
});

// NOTE :S3 업로드 함수
const uploadToS3 = (fileBuffer, fileName, mimeType, folderName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // NOTE :S3 버킷 이름
    Key: `${folderName}/${fileName}`, // NOTE :S3에 저장될 파일 이름
    Body: fileBuffer, // NOTE :파일 데이터
    ContentType: mimeType, // NOTE :파일의 MIME 타입
  };
  
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('S3 업로드 실패:', err);
        reject(err);
      } else {
        const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${folderName}/${fileName}`;
        resolve(cloudFrontUrl); // NOTE :CloudFront URL 반환
      }
    });
  });
};

// NOTE :파일 업로드 처리 함수
exports.uploadFile = async (req, res) => {
  const folderName = req.body.folderName;
  if (!req.file) {
    return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
  }

  try {
    const file = req.file;
    // NOTE :S3에 파일 업로드
    // NOTE : sharp로 이미지 변환 및 압축
    const compressedBuffer = await sharp(file.buffer)
      .resize(800) // NOTE : 이미지 폭 800px
      .jpeg({ quality: 50 })
      .toBuffer();

    const newFileName = `${file.originalname.replace(/\.[^/.]+$/, ".webp")}`; // NOTE : 확장자를 .webp로 변경

    const s3Url = await uploadToS3(compressedBuffer, newFileName, file.mimetype, folderName);

    // NOTE: 업로드 후 파일 삭제 (uploads 폴더에 저장된 경우)
    const tempFilePath = path.join(__dirname, '../uploads', file.originalname); // NOTE : 파일 경로 생성
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath); // 파일 삭제
    }

    res.status(200).json({
      message: '파일 업로드 성공',
      url: s3Url, // NOTE :업로드된 파일의 CloudFront URL 반환
    });
  } catch (error) {
    console.error('S3 업로드 중 오류:', error);
    res.status(500).json({ message: 'S3 업로드 실패', error: error.message });
  }
};
