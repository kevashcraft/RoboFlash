FROM node:12.3.1-stretch as builder


RUN apt-get update
RUN apt-get install -y default-jdk-headless
RUN apt-get install -y android-sdk
RUN apt-get install -y imagemagick

RUN cd /tmp && \
  git clone https://github.com/Shadowstyler/android-sdk-licenses.git && \
  cp -a android-sdk-licenses/*-license /usr/lib/android-sdk/licenses && \
  rm -rf android-sdk-licenses

RUN npm i -g @vue/cli cordova
RUN npm i -g cordova-res --unsafe-perm


RUN mkdir -p /cordova
WORKDIR /cordova
RUN cordova create robot_flash com.logicdudes.robot_flash robot_flash

WORKDIR /cordova/robot_flash
RUN cordova telemetry off
RUN cordova platform add android
RUN cordova plugin add cordova-plugin-file
RUN cordova plugin add cordova-plugin-device
RUN cordova plugin add cordova-plugin-screen-orientation
RUN cordova plugin add cordova-plugin-purchase
RUN cordova plugin add cordova-plugin-app-review
RUN cordova plugin add cordova-plugin-local-notification
RUN cordova build; exit 0

RUN mkdir -p /dist # mounted volume
RUN mkdir -p /secrets # mounted volume
RUN mkdir -p /app/src # mounted volume
RUN mkdir -p /app/public # mounted volume

WORKDIR /app
COPY ./app/package.json .
COPY ./app/package-lock.json .
RUN npm ci

# COPY ./app/.env .
COPY ./app/babel.config.js .
COPY ./app/vue.config.js .

WORKDIR /cordova/robot_flash

COPY ./build/build-app /bin/
COPY ./build/build-apk /bin/
COPY ./build/build-resources /bin/
COPY ./build/build-cordova-ios /bin/

# keytool -genkey -v -keystore robot-language-flashcards.keystore -alias robot_flash -keyalg RSA -keysize 2048 -validity 20000
