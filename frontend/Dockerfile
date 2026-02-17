FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]