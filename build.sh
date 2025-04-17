#!/bin/bash

set -e

echo -e "Installing app packages"
npm i

echo -e "Building app"
npm run build

cd pull-requests-api

echo -e "Installing api packages"
npm i

echo -e "Building app packages"
npm run build

cd ..