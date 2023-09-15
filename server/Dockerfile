FROM node:18-alpine

WORKDIR /eos

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

CMD npm run dev