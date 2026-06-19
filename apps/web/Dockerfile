# SIMCHA OS — Web (Next.js) production image. Build from apps/web as context.
FROM node:20-alpine
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000
# Demo mode runs standalone (no backend). Set NEXT_PUBLIC_DEMO=0 + NEXT_PUBLIC_API_URL to use the real API.
CMD ["npm", "run", "start"]
