FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --only=production && npm cache clean --force

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]