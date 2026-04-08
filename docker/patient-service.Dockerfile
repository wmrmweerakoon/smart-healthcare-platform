FROM node:18-alpine

WORKDIR /app

COPY services/patient-service/package*.json ./

RUN npm install --production

COPY services/patient-service/ .

RUN mkdir -p uploads

EXPOSE 5002

CMD ["node", "server.js"]
