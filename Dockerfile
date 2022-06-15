FROM node:14

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN npm install -g serverless@^1.0 serverless-offline@^7.0 typescript@^4.0

USER node