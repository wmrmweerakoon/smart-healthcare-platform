FROM node:18-alpine

WORKDIR /app

COPY services/appointment-service/package*.json ./

RUN npm install --production

COPY services/appointment-service/ .

EXPOSE 5004

CMD ["node", "server.js"]
