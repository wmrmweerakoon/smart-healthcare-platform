FROM node:18-alpine

WORKDIR /app

COPY services/api-gateway/package*.json ./

RUN npm install --production

COPY services/api-gateway/ .

EXPOSE 5000

CMD ["node", "server.js"]
