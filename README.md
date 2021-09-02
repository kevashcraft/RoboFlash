# RoboFlash <a href="https://roboflash.app" title="Open RoboFlash"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/readme-images/open-web.png?raw=true" width="150" /></a> <a href="https://play.google.com/store/apps/details?id=com.logicdudes.robot_flash" title="RoboFlash the Google Play Store"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/play-store.png?raw=true" width="135" /></a> <a href="https://apps.apple.com/us/app/roboflash/id1547172369" title="RoboFlash the App Store"><img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/app-store.png?raw=true" width="135" /></a>

# ROBOFLASH
Foreign Language Flashcards with Pictures and Audio in English, Spanish and Korean

<img src="https://github.com/kevashcraft/RoboFlash/raw/main/res/roboflash-intro-dialog.png?raw=true" width="135" />

### Summary
Roboflash is a language learning app that takes advantage of a few different APIs (Giphy, Pixabay, Google TTS, Google Sheets) to turn a list of words in a spreadsheet into flashcards for multiple languages, each with a picture and audio to help facilite the learning process.

**Google Sheets** -> **Google Translate** -> **Giphy** + **Pixabay** -> **Google TTS** -> **Google Cloud Storage** = **Audio/Visual Language Data**

**NodeJS** + **VueJS** + **Cordova** = **WebApp** + **Android App** + **iOS App**

## Building

## Language Data
Getting the data requires two human actions and three computer actions.

### Words
The language data starts with a column of words (added by the programmer or a collaborator) in a Google Sheets spreadsheet. That column is then translated into different langues using the built-in translate function, i.e. =GOOGLETRANSLATE(A2, “en”,”es”), and put into the adjecent columns. During the build process, a script will retrieve the words from the sheet in their various translations.

### Images
#### Search & Retrieve
The images are sourced based on the word type, verbs get GIFs and everything else a single frame (JPEG/PNG) image. The process hits the appropriate image API with a search query for the English form of each word, and saves the top 5 results in a GCS bucket, hashing their values so subsequent runs can skip the download.
#### Selection
A standalone applet is then ran to display a webpage with each possible image for each word. The programmer or collaborator selects one image for each word by clicking on it. After all have been selected, the save button is pressed which saves the selected images in a bundle with the rest of the words in the group (deck).

### Audio
During the build process, the Google TTS API is used to generate the audio for each word. The audio is saved to a GCS bucket so it's only necessary to retrieve it once.

### Deck Bundles
Once the words have been retrieved, images selected, and the audio downloaded, all of the data is base64 encoded and packaged into a JSON file that's saved in a public GCS bucket. Whenever the user is in the app and selects a deck of words, the corresponding JSON file is downloaded and saved to their device.


make decks
main() -> populate(), server(), deploy()

server -> localhost:48080


