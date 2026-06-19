# SIMCHA OS API (NestJS) — production image
FROM node:20-alpine AS base
WORKDIR /app

# install workspace deps (api + db)
COPY package.json package-lock.json* ./
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN npm install --omit=dev=false

# build db client + api
COPY packages/db packages/db
COPY apps/api apps/api
RUN npm run build -w @simcha/db \
  && npm run build -w @simcha/api

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
