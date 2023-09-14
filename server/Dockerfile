FROM node:18-alpine

WORKDIR /eos

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

COPY . .

CMD npm run start