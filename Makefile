default: dev

.PHONY: build decks

bash: build_bash
	docker-compose -f build/docker-compose.yaml -p robot_flash run bash bash

build_bash:
	docker-compose -f build/docker-compose.yaml -p robot_flash build bash

build:
	docker-compose -f build/docker-compose.yaml -p robot_flash build app

dev: down build
	docker-compose -f build/docker-compose.yaml -p robot_flash up app

down:
	docker-compose -f build/docker-compose.yaml -p robot_flash down -v

decks:
	docker run \
			-it \
			-v $(shell pwd)/decks:/decks \
			-v $(shell pwd)/secrets:/secrets \
									-p 48080:80 \
									node:13.2.0-buster-slim bash

cordova_build: build
	docker build -t robot_flash_cordova -f build/cordova.dockerfile .

cordova: cordova_build
	docker run \
			-it \
			-v $(shell pwd)/cordova-ios:/cordova-ios \
			-v $(shell pwd)/dist:/dist \
			-v $(shell pwd)/res:/res \
			-v $(shell pwd)/app/src:/app/src \
			-v $(shell pwd)/app/public:/app/public \
			-v $(shell pwd)/build/config-ios.xml:/cordova/robot_flash/config-ios.xml \
			-v $(shell pwd)/build/config.xml:/cordova/robot_flash/config.xml \
								robot_flash_cordova bash

cordova_prod: cordova_build
	docker run \
			-it \
			-v $(shell pwd)/dist:/dist \
			-v $(shell pwd)/secrets:/secrets \
			-v $(shell pwd)/app/src:/app/src \
			-v $(shell pwd)/app/public:/app/public \
			-v $(shell pwd)/build/config.xml:/cordova/robot_flash/config.xml \
								robot_flash_cordova bash -c "\
																		build-app; \
																		cd /cordova/robot_flash; \
																		rm -rf www; \
																		mv /app/dist www; \
																		cordova build android \
								--release \
								-- \
								--keystore /secrets/robot-language-flashcards.keystore \
								--alias robot_flash \
								--storePassword=$(keystore_pass) \
								--password=$(keystore_pass) && \
								cp /cordova/robot_flash/platforms/android/app/build/outputs/apk/release/app-release.apk /dist/app-release.apk"

prod_build:
	docker build -f build/production.dockerfile -t us.gcr.io/ld-k8s/robot-language-flashcards:latest .

prod_push: prod_build
	docker push us.gcr.io/ld-k8s/robot-language-flashcards:latest

upgrade: prod_build prod_push
	helm upgrade robot-language-flashcards build/chart

install: prod_push
	helm install robot-language-flashcards build/chart
