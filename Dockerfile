FROM victorbjelkholm/chromium-xvfb-js:latest

# Dependency for phantomjs
RUN apt-get update && apt-get install bzip2

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json

RUN npm install --loglevel=http

COPY . /usr/src/app
