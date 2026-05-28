import multer from "multer";
import path from "path";
import fs from "fs";
const dir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, dir),
filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
export const upload = multer({ storage });