# AI Tool Evidence

## Công cụ sử dụng
- Sử dụng AI assistant (GitHub Copilot / ChatGPT) để kiểm tra yêu cầu, phân tích dự án, và tự động thêm Dockerfile + Docker Compose.

## Lý do sử dụng AI
- Tự động xác định phần thiếu trong dự án.
- Tạo Dockerfile tiêu chuẩn cho `apps/api` và `apps/web`.
- Cập nhật lại cấu hình Docker Compose để chạy đầy đủ stack.
- Tạo tài liệu minh chứng cho AI tool trong quá trình phát triển.

## Prompts đã sử dụng
1. `đọc folder expensemanager-main`
2. `'vite' is not recognized as an internal or external command, operable program or batch file.`
3. `check xem đã đủ các yêu cầu chưa`
4. `còn thiếu gì thì làm cho tôi`
5. `Before modification, inspect server.ts main.tsx`
6. `create Dockerfile and docker compose for this app`

## Kết quả
- Thêm `apps/api/Dockerfile` và `apps/web/Dockerfile`.
- Thêm `apps/web/nginx.conf` để phục vụ SPA React.
- Cập nhật `infra/docker-compose.yml` để chạy API, Web và PostgreSQL.
- Cập nhật hướng dẫn Docker trong `README.md`.
