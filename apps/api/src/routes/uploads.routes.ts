import { Router } from "express";
import { upload } from "../../infra/upload";
import { authRequired } from "../middlewares/auth"; // ✅ đổi từ { auth } -> { authRequired }

const r = Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload một file
 *     tags: [Uploads]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: OK }
 */
r.post("/", authRequired, upload.single("file"), (req, res) => {  // ✅ dùng authRequired
  const url = `/uploads/${req.file?.filename}`;
  res.json({ url });
});

export default r;
