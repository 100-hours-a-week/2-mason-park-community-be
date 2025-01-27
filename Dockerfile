FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

# production용 .env 파일 복사
COPY config/.env /app/config/.env

COPY . .

CMD ["node", "server.js"]