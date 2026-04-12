FROM node:18-alpine

WORKDIR /app

COPY services/doctor-service/package*.json ./

RUN npm install --production

COPY services/doctor-service/ .

EXPOSE 5003

CMD ["node", "server.js"]
