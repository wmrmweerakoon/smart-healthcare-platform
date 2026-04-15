FROM node:18-alpine

WORKDIR /app

COPY services/notification-service/package*.json ./

RUN npm install --production

COPY services/notification-service/ .

EXPOSE 5006

CMD ["node", "server.js"]
