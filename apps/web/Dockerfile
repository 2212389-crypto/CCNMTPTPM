FROM node:20-alpine AS builder
WORKDIR /workspace

COPY tsconfig.base.json ./
COPY apps/web/package.json apps/web/package-lock.json ./apps/web/

WORKDIR /workspace/apps/web
RUN npm ci

WORKDIR /workspace
COPY . .

WORKDIR /workspace/apps/web
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/apps/web .
EXPOSE 3000
CMD ["npm", "run", "start"]
