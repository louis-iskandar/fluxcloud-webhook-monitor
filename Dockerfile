FROM node:8.11.4-alpine

COPY . /app

WORKDIR /app

RUN npm install

CMD npm startdoc