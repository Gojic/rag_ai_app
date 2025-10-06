import multer from "multer";
import multerS3 from "multer-s3";
import { randomUUID } from "crypto";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import "dotenv/config";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "private",
    key: (req, file, cb) => {
      const uniqueName = `uploads/${randomUUID()}${path.extname(
        file.originalname
      )}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (["application/pdf", "text/plain"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

export default upload;
