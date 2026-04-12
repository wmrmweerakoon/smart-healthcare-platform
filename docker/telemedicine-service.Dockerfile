FROM node:18-alpine

WORKDIR /app

COPY services/telemedicine-service/package*.json ./

RUN npm install --production

COPY services/telemedicine-service/ .

EXPOSE 5009

CMD ["node", "server.js"]
