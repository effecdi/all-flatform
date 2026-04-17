# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 마이그레이션 스크립트도 빌드
RUN npx esbuild server/migrate.ts --bundle --platform=node --format=cjs --outfile=dist/migrate.cjs --external:pg --external:pg-native

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
