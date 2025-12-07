FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3022

CMD ["yarn", "start"]

