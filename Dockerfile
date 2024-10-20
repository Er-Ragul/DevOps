FROM node:alpine

WORKDIR /exchange

COPY . .

RUN mkdir library

RUN mkdir db

RUN npm install

EXPOSE 3002

ENTRYPOINT ["node", "index.js"]