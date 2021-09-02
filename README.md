# RoboFlash <a href="https://roboflash.app" title="Open RoboFlash" target="_blank"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/open-web.png?raw=true" width="150" /></a> <a href="https://play.google.com/store/apps/details?id=com.logicdudes.robot_flash" title="RoboFlash the Google Play Store" target="_blank"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/play-store.png?raw=true" width="145" /></a> <a href="https://apps.apple.com/us/app/roboflash/id1547172369" title="RoboFlash the App Store" target="_blank"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/app-store.svg?raw=true" width="135" /></a>

**Foreign Language Flashcards with Pictures and Audio in English, Spanish and Korean**

<p align="center">
  <img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/roboflash.gif?raw=true" width="350" />
</p>

### Summary
Roboflash is a cross-platform language learning app that takes advantage of a few different APIs (Giphy, Pixabay, Google TTS, Google Sheets) to turn a list of words in a spreadsheet into flashcards for multiple languages, each with a picture and audio to help facilite the learning process.

#### Words & Images
Google Sheets -> Google Translate -> Giphy + Pixabay -> Google TTS -> Google Cloud Storage = Audio/Visual Language Data

#### App Deployment
NodeJS + VueJS + Cordova = WebApp + Android App + iOS App

## Building The App
RoboFlash has three parts to build: the language data (words, audio, images); the VueJS app; the mobile apps.

## Language Data
Getting the data requires two human actions and three computer actions.

### Words

**Google Sheets** -> **Google Translate** -> **Foreign Language Vocab**

The language data starts with a column of words (added by the programmer or a collaborator) in a Google Sheets spreadsheet. That column is then translated into different langues using the built-in translate function, i.e. =GOOGLETRANSLATE(A2, “en”,”es”), and put into the adjecent columns. During the build process, a script will retrieve the words from the sheet in their various translations.

<p align="center">
  <img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/roboflash-spreadsheet.png?raw=true" width="700" />
</p>
<p align="center">
  <img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/roboflash-spreadsheet-deck.png?raw=true" width="350" />
</p>


### Images
#### Search & Retrieve

**Giphy** + **Pixabay** = **Vocab Images**

The images are sourced based on the word type, verbs get GIFs and everything else a single frame (JPEG/PNG) image. The process hits the appropriate image API with a search query for the English form of each word, and saves the top 5 results in a GCS bucket, hashing their values so subsequent runs can skip the download.


#### Image Selection
A standalone applet is then ran to display a webpage with each possible image for each word. The programmer or collaborator selects one image for each word by clicking on it. After all have been selected, the save button is pressed which saves the selected images in a bundle with the rest of the words in the group (deck).

<p align="center">
  <img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/image-selection.png?raw=true" width="350" />
</p>


### Audio

**Google TTS API** + **Vocab Words** = **Audio Pronounciation**

During the build process, the Google TTS API is used to generate the audio for each word. The audio is saved to a GCS bucket so it's only necessary to retrieve it once.


### Deck Bundles

**Words** + **Images** + **Audio** -> **Base64** -> **JSON** -> **Google Cloud Storage**

Once the words have been retrieved, images selected, and the audio downloaded, all of the data is base64 encoded and packaged into a JSON file that's saved in a public GCS bucket. Whenever the user is in the app and selects a deck of words, the corresponding JSON file is downloaded and saved to their device.

Keeping all of the data separated by deck/group of words and stored on GCS has three large payoffs. 1) The user can download a single file that's not too big (~10MB), 2) the list of decks and their content can be updated without needing to redeploy the app (WOOT!), and 3) the data store automatically and basically infinitely scales without materially increasing overhead (it's just a publically accessible GCS file).


## Make
Refer to the Makefile for all aspects of the app. It's the controller and has the following commands.

### Decks

`make decks`

This will run a standard node container with the /decks directory volume mounted and beginning at a BASH prompt.

`cd /decks && node decks.js`
Go into the /decks directory and run the decks.js file. The decks.js file has a `main()` function which calls the three other primary functions, `populate()`, `server()`, `deploy()`.

**populate()** retrieves the list of words from the Google Sheet, downloads images and audio

**server()** launches a simple local server at <a href="http://localhost:48080">localhost:48080</a> where one can select the image to associate with each word (5 images are retrieved from `populate()`, but the best needs to be chosen).
1. Select a deck from the dropdown
2. Select an image for each word
3. Click `Save` to send that selection back to the local server which saves the data to GCS

**deploy()** takes the words, audio, and selected images, encodes the audio and images to base64, and saves each deck/set of words to a public GCS bucket which the app will download whenever the user selects that deck.

Another file, the decklist.json file, is also uploaded on deploy() and retrieved from the app each time it's launched so that new decks can be added without needing to redeploy the codebase.

The decks each have a version number. This allows the individual decks to be updated and will trigger a redownload if the user has already downloaded the deck (saved to the device).

### Dev

`make dev`

The default make command is `make dev` which will launch the container in build/docker-compose.yaml - which is defined in build/development.dockerfile - with the /app/src and /app/public directories mounted and port 58300 mapped to <a href="http://localhost:58300">localhost:58300</a>.

`make bash` can also be ran to access the command line to update the npm packages.

### Deploy

#### Deploying to the Web

`make upgrade`

To upgrade the web deployment, the `make upgrade` command will cause the app to be bundled for production with the build/production.dockerfile configuration - which run `npm build` and copies the /dist data along with an nginx.conf file to another container.

Once the container is built and pushed to the registry, the `helm upgrade` is executed to initiate the required updates to the Kubernetes cluster. The chart is mostly standard (changes made in the Chart.yaml and values.yaml files), with the exception of the templates/deployment.yaml file which contains an annotation to ensure the container is redeployed on each upgade ("rollme: {{ randAlphaNum 15 | quote }}").

### Deploying to Androind

`make cordova_prod`

To create a signed APK for the Play Store, the `make cordovoa_prod` command will initiate a new build of the /dist directory and then copy it over to a /cordova directory inside of the container. This command is actually ran with a secret file that contains the signing key. To run this command, one must have actually read this far and know to run secrets/build-apk.sh, which just runs the above make command with the addition of the signing key.

