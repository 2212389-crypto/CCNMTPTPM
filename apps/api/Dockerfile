FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY . .

RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npx", "tsx", "src/server.ts"]
