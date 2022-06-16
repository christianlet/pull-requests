FROM node:16

ENV NPM_CONFIG_PREFIX=/var/www/.npm-global
ENV PATH=$PATH:/var/www/.npm-global/bin

WORKDIR /app

RUN npm install -g serverless \
    npm install -g serverless-offline \
    npm install -g typescript

EXPOSE 3000