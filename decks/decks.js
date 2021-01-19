const fs = require('fs')
const readline = require('readline')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const crypto = require('crypto')
const axios = require('axios')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');

const spreadsheetId = '1mI83bix5KfrBJpZ4Dnlr04saImp0crQ8mgG7TsoPxEU'
const pixalBayApiKey = JSON.parse(fs.readFileSync('../secrets/pixelbay.json')).apiKey
const giphyApiKey = JSON.parse(fs.readFileSync('../secrets/giphy.json')).apiKey

// google text-to-speech
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsClient = new textToSpeech.TextToSpeechClient({keyFilename: '/secrets/spanish-photo-flash-tts.json'});

// google storage
const {Storage} = require('@google-cloud/storage')
const storage = new Storage({keyFilename: '/secrets/robot-language-flashcards-gcs.json'})
const deckDataBucket = 'rlf-deck-data'
const decksBucket = 'rlf-decks'

const MAX_DECK_ROWS = 50
const MAX_WORD_ROWS = 50
const DeckColumns = {
    slug: 0,
    version: 1,
    status: 2,
    type: 3,
    emoji: 4
}
axios.defaults.headers.common['User-Agent'] = 'Robot Language Flashcards - contact@robot-language-flashcards.com';

const languages = [
    {
        slug: 'en',
        deckNameCol: 5,
        audios: [
            {
                slug: 'en1',
                speakingRate: '.9',
                voice: {
                    languageCode: 'en-US',
                    ssmlGender: 'FEMALE',
                    name: 'en-US-Wavenet-H'
                }
            }
        ]

    },
    {
        slug: 'es',
        deckNameCol: 7,
        audios: [
            {
                slug: 'es1',
                speakingRate: '.9',
                voice: {
                    languageCode: 'es-ES',
                    ssmlGender: 'FEMALE',
                    name: 'es-ES-Standard-A'
                }
            }
        ]
    },
    {
        slug: 'ko',
        deckNameCol: 9,
        audios: [
            {
                slug: 'ko1',
                speakingRate: '.9',
                voice: {
                    languageCode: 'ko-KR',
                    ssmlGender: 'FEMALE',
                    name: 'ko-KR-Wavenet-C'
                }
            }
        ]
    },
]

main()

async function main() {
    const decks = await getDecks()
    console.log('decks', decks)
    // await populate(decks)
    // await server(decks)
    await deploy(decks)
}

async function getDecks () {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetId)  
    await spreadsheet.useServiceAccountAuth(require('/secrets/spanish-photo-flash-decks-2b5f6a11103f.json'))
    await spreadsheet.loadInfo()

    const decks = await getDeckList(spreadsheet)

    for (let idx=0; idx<decks.length; idx++) {
        const deck = decks[idx]
        decks[idx].cards = await getCards(spreadsheet, deck.slug)
    }

    return decks
}

async function populate(decks) {
    for (let deckIdx=0; deckIdx<decks.length; deckIdx++) {
        const deck = decks[deckIdx]
        for (let cardIdx=0; cardIdx<deck.cards.length; cardIdx++) {
            let card = deck.cards[cardIdx]
            await getAudio(card)
            await getImages(deck.type, card)
            // await new Promise(r => setTimeout(r, 500))
        }
    }
}

async function deploy (decks) {
    const deckList = []
    for (let deckIdx=0; deckIdx<decks.length; deckIdx++) {
        const deck = decks[deckIdx]
        deckList.push(deck)
    }
    console.log('JSON.stringify(deckList)', JSON.stringify(deckList))
    await storage.bucket(decksBucket).file('decklist.json').save(JSON.stringify(deckList), {gzip: true, resumable: false})
    // return
    for (let deckIdx=0; deckIdx<decks.length; deckIdx++) {
        console.log('deckIdx', deckIdx)
        const deck = decks[deckIdx]
        const cards = []
        for (let idx=0; idx<deck.cards.length; idx++) {
            console.log('idx', idx)
            const card = deck.cards[idx]
            const selected = await gcsFileExists('selections', card.slug) ? await gcsReadFile('selections', card.slug) : false
            if (selected) {
                console.log('SELECTED', selected)
                card.image = await gcsReadFile('images', selected.split('.')[0])
                console.log('card.image', card.image.slice(0, 100))
                card.audios = {}
                for (let lidx=0; lidx<languages.length; lidx++) {
                    if (!languages[lidx].audios) continue
                    for (let aidx=0; aidx<languages[lidx].audios.length; aidx++) {
                        const audio = languages[lidx].audios[aidx]
                        const filename = `${card.slug}-${audio.slug}`
                        if (await gcsFileExists('audio', filename)) {
                            card.audios[audio.slug] = await gcsReadFile('audio', filename)
                            console.log('got uadio for', audio.slug)
                        }
                    }
                }
                cards.push(card)
                console.log('added card1')
            }
        }
        console.log('saving deck')
        await storage.bucket(decksBucket).file(`${deck.slug}.json`).save(JSON.stringify(cards), {gzip: true, resumable: false})
    }

}

async function server (decks) {
    const server = express()

    server.use(bodyParser.json())

    server.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/decks.html'))
    })
    server.get('/decklist', async (req, res) => {
        const deckList = []
        for (let idx=0; idx<decks.length; idx++) {
            deckList.push({
                title: decks[idx].titles.en,
                value: decks[idx].slug
            })
        }
        res.send(JSON.stringify(deckList))
    })

    server.get('/decks/:slug', async (req, res) => {
        const deck = decks.find(deck => deck.slug === req.params.slug)
        console.log('gettings cards for', deck.slug)
        // need list of cards, with word, images, and selected
        const cards = []
        for (let idx=0; idx<deck.cards.length; idx++) {
            const card = deck.cards[idx]
            console.log('idx', idx)
            card.images = {}
            const selected = await gcsFileExists('selections', card.slug) ? await gcsReadFile('selections', card.slug) : false
            const searchResults = await gcsReadFile('searches', card.slug, 'json')
            for (let idx in searchResults) {
                const resInfo = searchResults[idx]
                // console.log('resInfo', resInfo)
                let ext = deck.type === 'gifs' ? 'gif'
                    : resInfo.previewURL.split('.').pop().toLowerCase()
        
                if (ext === 'jpg') ext = 'jpeg'
        
                const imgId = deck.type === 'gifs' ? resInfo.id : resInfo.id.toString()
                const imgSrc = deck.type === 'gifs' ? 'giphy' : 'pixabay'
                const imgHash = crypto.createHash('md5').update(imgSrc + imgId).digest('hex')
                const filename = `${imgHash}.${ext}`
                if (await gcsFileExists('images', filename)) {
                    card.images[imgHash] = Object.assign({}, {
                        url: `https://storage.googleapis.com/rlf-deck-data/images/${filename}`,
                        filename,
                        selected: filename === selected
                    })
                } else {
                    console.log('images does not exist', filename)
                }
            }
            cards.push(card)
        }
        res.send(JSON.stringify(cards))
    })
    server.get('/cards/:slug/:selection', async (req, res) => {
        console.log('saving', req.params.slug, req.params.selection)
        await gcsFileSave('selections', req.params.slug, req.params.selection)
        console.log('DATA SAVED!')
        res.sendStatus(200)
    })
    console.log("serving")
    server.listen(80)
}

async function getDeckList(deckDataSpreadsheet) {
    const sheet = deckDataSpreadsheet.sheetsByTitle['Deck List']

    await sheet.loadCells(`A1:J${MAX_DECK_ROWS}`);

    const deckList = []
    for (let index=0; index<MAX_DECK_ROWS; index++) {
        const deck = { index }
        Object.keys(DeckColumns).forEach(col => {
            deck[col] = sheet.getCell(index, DeckColumns[col]).value
        })
        if (!deck.slug) continue
        if (deck.status !== 'enabled') continue
        deck.titles = {}

        languages.filter(language => !!language.deckNameCol).forEach(language => {
            deck.titles[language.slug] = sheet.getCell(index, language.deckNameCol).value
        })
        console.log('deck.titles', deck.titles)
        deckList.push(deck)
    }

    return deckList
}

async function getCards(deckDataSpreadsheet, deck) {
    const sheet = deckDataSpreadsheet.sheetsByTitle[deck]

    await sheet.loadCells(`A1:C${MAX_WORD_ROWS}`);

    const cards = []
    
    for (let idx=1; idx<MAX_WORD_ROWS; idx++) {
        const words = {}
        languages.forEach((language, lidx) => {
            const word = sheet.getCell(idx, lidx).value
            if (!word) return
            words[language.slug] = word
        })
        if (Object.keys(words).length) {
            const card = { idx, words }
            card.slug = card.words.en.toLowerCase().replace(/[\W_]+/g, '')
            console.log('card', card)
            cards.push(card)
        }
    }
// ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????//???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????UUU
    return cards
}


async function getImages(imgType, card) {
    let searchResults
    if (await gcsFileExists('searches', card.slug)) {
        console.log('reading searches', card.words.en)
        searchResults = await gcsReadFile('searches', card.slug, 'json')
    } else {
        const url = imgType === 'gifs' ?
            `http://api.giphy.com/v1/gifs/search?q=${card.words.en.replace(/ /g, '+')}&api_key=${giphyApiKey}&limit=8`
            : `https://pixabay.com/api/?key=${pixalBayApiKey}&per_page=10&safesearch=true&q=${card.words.en.replace(/ /g, '+')}&image_type=photo&pretty=true`
        
    
        await new Promise(r => setTimeout(r, 500))
        console.log('getting searches', card.words.en)
        const resp = await axios.get(url)
        searchResults = imgType === 'gifs' ? resp.data.data : resp.data.hits
        await gcsFileSave('searches', card.slug, searchResults, 'json')
    }

    for (let idx in searchResults) {
        const resInfo = searchResults[idx]
               
        let ext = imgType === 'gifs' ? 'gif'
            : resInfo.previewURL.split('.').pop().toLowerCase()

        if (ext === 'jpg') ext = 'jpeg'

        let imgId = imgType === 'gifs' ? resInfo.id : resInfo.id.toString()
        let imgSrc = imgType === 'gifs' ? 'giphy' : 'pixabay'
        let imgHash = crypto.createHash('md5').update(imgSrc + imgId).digest('hex')
        const filename = `${imgHash}.${ext}`
        if (!await gcsFileExists('images', filename)) {
            try {
                const imgReqUrl = imgType === 'gifs' ? resInfo.images.fixed_width.url
                    : resInfo.webformatURL
                console.log('getting image', imgReqUrl)
                await new Promise(r => setTimeout(r, 1500))
                const imgReq = await axios.get(imgReqUrl, {responseType: 'arraybuffer'})
                // save both, for fast preview and already encoded
                console.log('saving to gcs1')
                await gcsFileSave('images', filename, imgReq.data)
                const imgData = `data:image/${ext};base64,` + Buffer.from(imgReq.data, 'binary').toString('base64')
                console.log('saving to gcs2')
                await gcsFileSave('images', imgHash, imgData)
                console.log('image retrieved')
            } catch (error) {
                console.log("Missing GIFY URL", error)
            }
        } else {
            console.log('image exists!')
        }
    }
}

async function getAudio(card) {
    for(let lidx=0; lidx<languages.length; lidx++) {
        const language = languages[lidx]
        if (!language.audios) continue
        for(let aidx=0; aidx<language.audios.length; aidx++) {
            const audio = language.audios[aidx]
            const filename = `${card.slug}-${audio.slug}`
            if (!await gcsFileExists('audio', filename)) {
                console.log('getting audio')

                const request = {
                    input: { text: card.words[language.slug] },
                    voice: audio.voice,
                    speakingRate: audio.speakingRate,
                    audioConfig: {
                        audioEncoding: 'MP3',
                        pitch: 0,
                        effectsProfileId: ['headphone-class-device'],
                        speakingRate: '.9'
                    }
                }
                await new Promise(r => setTimeout(r, 500))
                let [response] = await ttsClient.synthesizeSpeech(request)
                const audioData = 'data:audio/mp3;base64,' + response.audioContent.toString('base64')
                await gcsFileSave('audio', filename, audioData)
            } else {
                console.log('audio exists!')
            }
        }
    }
}

async function gcsFileExists(folder, file) {
    const filename = `${folder}/${file}`
    const exists = await storage.bucket(deckDataBucket).file(filename).exists()
    return exists[0]
}

async function gcsFileSave(folder, file, data, type) {
    try {
        const filename = `${folder}/${file}`
        if (type === 'json') data = JSON.stringify(data)
        await storage.bucket(deckDataBucket).file(filename).save(data, {gzip: true, resumable: false})
    } catch (error) {
        console.log('error', error)
    }
}

async function gcsReadFile(folder, file, type) {
    const filename = `${folder}/${file}`
    const request = await storage.bucket(deckDataBucket).file(filename).download()
    let data = request[0].toString()
    if (type === 'json') {
        data = JSON.parse(data)
    }

    return data
}

async function saveData(filename, data, public) {
    if (public) {
        await storage.bucket(decksBucket).file(filename).save(JSON.stringify(data), {gzip: true, resumable: false})
    } else {
        await storage.bucket(fullDecksBucket).file(filename).save(JSON.stringify(data), {gzip: true, resumable: false})
    }
}
