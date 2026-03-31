FROM node:18-alpine

WORKDIR /app

COPY services/admin-service/package*.json ./

RUN npm install --production

COPY services/admin-service/ .

EXPOSE 5008

CMD ["node", "server.js"]
