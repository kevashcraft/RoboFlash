import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import axios from 'axios'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  key: 'RLF',
  storage: window.localStorage
})

const localDecks = {}
let cards = []

/* global LocalFileSystem */

async function readFile(directory, filename) {
  try {
    return new Promise((resolve, reject) => {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fs => {
        fs.root.getDirectory(directory, { create: true }, dir => {
          dir.getFile(filename, { exclusive: false }, fileEntry => {
            fileEntry.file(file => {
              let reader = new FileReader()
              reader.onloadend = () => {
                let data = JSON.parse(reader.result)
                resolve(data)
              }
              reader.readAsText(file)
            }, error => reject('could not read file: ' + error.toString()))
          }, error => reject('could not open file: ' + error.toString()))
        }, error => reject('could not open directory: ' + error.toString()))
      }, error => reject('could not request filesystem: ' + error.toString()))
    })
  } catch (error) {
    window.debugInfo.push(error.toString())
  }
}

async function writeFile (directory, filename, data, isBlob) {
  window.debugInfo.push('writing-' + directory + ' - ' + filename)
  return new Promise((resolve, reject) => {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fs => {
      fs.root.getDirectory(directory, { create: true }, dir => {
        window.debugInfo.push('got directory-' + directory + ' - ' + filename)
        dir.getFile(filename, { create: true, exclusive: false }, fileEntry => {
          fileEntry.createWriter(fileWriter => {
              fileWriter.onwriteend = () => resolve(fileEntry.toURL())
              fileWriter.onerror = error => reject('unable to write file: ' + error.toString())
              let dataObj = isBlob ? data : new Blob([JSON.stringify(data)], { type: 'text/plain' })
              fileWriter.write(dataObj)
          });
        }, error => reject('could not get file: ' + error.toString()))
      }, error => reject('could not create directory: ' + error.toString()))
    }, error => reject('could not access filesystem: ' + error.toString()))
  })
}

function  shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

export default new Vuex.Store({
  state: {
    isApp: !!window.cordova,
    referenceLanguage: 'en',
    learningLanguage: 'es',
    audioSlug: 'es1',
    prevActiveDate: '',
    globalCardCount: 0,
    activeCardCount: 0,

    welcomeDialogDisplayed: false,
    firstTestDialogDisplayed: false,
    testCompleteDialogEnabled: true,
    rateUsDialogEnabled: true,
    dialog: 'none',

    languages: [
      {
        title: 'English',
        slug: 'en',
        reference: true,
        learning: false
      }, {
        title: 'Spanish',
        slug: 'es',
        reference: false,
        learning: true,
        audios: ['es1']
      }, {
        title: 'Korean',
        slug: 'ko',
        reference: false,
        learning: true,
        audios: ['ko1']
      }
    ],

    deckList: [],
    proposedDeck: {},
    downloadProgress: -1,

    deck: {},
    cardIdx: 0,
    questionViewCounts: {},

    testMode: false,
    scores: [],
    
    sortMethod: 'alpha',
    showHints: 'always',
    showAnswers: 'onTap',

    audioEnabled: true,
    darkTheme: false,
    testModeEnabled: true
  },
  mutations: {
    addScore (state, score) {
      state.scores.push(score)
    },
    setGeneric (state, {prop, value}) {
      state[prop] = value
    },
    setLanguage (state, language) {
      state.learningLanguage = language
      state.audioSlug = state.languages.find(l => l.slug === language).audios[0]
      
    },
    setDeckList (state, deckList) {
      // update local deck list
      console.log('set deckList', deckList)
      for (let idx in deckList) {
        const deck = deckList[idx]
        const localDeck = state.deckList.find(deck => deck.slug === deck.slug)
        if (localDeck && localDeck.version >= deck.version) deckList[idx] = localDeck
        // if running in web, mark all as not yet downloaded
        if (!state.isApp) {
          deckList[idx].downloaded = false
        }
      }
      state.deckList = deckList
    },
    setDialog (state, dialog) {
      state.dialog = dialog
    },
    setDownloadProgress (state, downloadProgress) {
      if (downloadProgress > 100) downloadProgress = 100
      state.downloadProgress = downloadProgress
    },
    setProposedDeck (state, proposedDeck) {
      state.proposedDeck = proposedDeck || {}
    },
    setDeck (state, deck) {
      state.cardIdx = -1
      state.cardIdx = 0
      state.deck = deck
    },
    setDownloaded (state, deck) {
      const deckList = [...state.deckList]
      const deckIdx = deckList.findIndex(d => d.slug === deck.slug)
      deckList[deckIdx].downloaded = true
      state.deckList = []
      state.deckList = deckList
    },
    initDeckDownloaded (state) {
      if (!state.isApp) {
        state.deck.downloaded = false
      }
    },
    nextCard (state) {
      if (state.cardIdx >= cards.length - 1) {
        if (state.testModeEnabled) {
          if (state.testMode) {
            const score = Math.round(state.scores.filter(score => score).length / state.scores.length * 100)
            if (!state.deckList[state.deck.name].bestScore || score > state.deckList[state.deck.name].bestScore) {
              state.deckList[state.deck.name].bestScore = score
            }
            if (state.testCompleteDialogEnabled) state.dialog = 'testComplete'
          } else {
            if (!state.firstTestDialogDisplayed) state.dialog = 'firstTest'
            state.scores = []
          }
          state.testMode = !state.testMode
        }
        state.cardIdx = 0
      } else {
        state.cardIdx += 1
      }
    }, 
    prevCard (state) {
      if (state.cardIdx < 1) {
        state.cardIdx = cards.length - 1
      } else {
        state.cardIdx -= 1
      }
    }, 
    resetActiveCardCount (state) {
      state.activeCardCount = 0
    },
    setCardIdx (state, cardIdx) {
      state.cardIdx = cardIdx
    },
    setPrevActiveDate (state, prevActiveDate) {
      state.prevActiveDate = prevActiveDate
    },
    setSortMethod (state, sortMethod) {
      state.sortMethod = sortMethod
    },
    setShowHints (state, showHints) {
      state.showHints = showHints
    },
    setShowAnswers (state, showAnswers) {
      state.showAnswers = showAnswers
    },
    setTestMode (state, testMode) {
      state.testMode = testMode
    },
    toggleAudioEnabled (state) {
      state.audioEnabled = !state.audioEnabled
    },
    toggleDarkTheme (state) {
      state.darkTheme = !state.darkTheme
    },
    toggleTestModeEnabled (state) {
      state.testModeEnabled = !state.testModeEnabled
      if (!state.testModeEnabled) state.testMode = false
    },
  },
  actions: {
    // downloadDeck({ commit, state }) {
    //   //
    // },
    async getDeckList({ commit }) {
      try {
        const request = await axios.get('https://storage.googleapis.com/rlf-decks/decklist.json')
        const deckList = request.data
        if (typeof deckList !== 'object' || !Object.keys(deckList).length) {
          throw Error('invalid deck list')
        }
        commit('setDeckList', deckList)
      } catch (error) {
        console.log('error getting deck list', error)
      }
    },
    async deckChange({ commit, dispatch, state }, deck) {
      commit('setTestMode', false)
      const filename = deck.slug + '.json'
      // if not loaded
      if (!deck.downloaded) {
        if (deck.type === 'gifs' && deck.name !== state.proposedDeck.name) {
          // confirm gifs
          commit('setProposedDeck', deck)
          return
        }
        commit('setProposedDeck', {})
        // const bigDownload = parseInt(deck.size) > 5000000
        commit('setDownloadProgress', 0)
        const request = await axios.get(`https://storage.googleapis.com/rlf-decks/${filename}`, {
          onDownloadProgress: progress => {
            const downloadProgress = Math.round(progress.loaded / (parseInt(deck.size) * 1.4) * 100)
            commit('setDownloadProgress', downloadProgress)
          }
        })
        commit('setDownloadProgress', -1)
        commit('setDownloaded', deck)

        const deckData = request.data

        if (!state.isApp) {
          localDecks[deck.slug] = deckData
        } else {
          for (let cardKey in deckData) {
            const url = deckData[cardKey].image
            const fetchRes = await fetch(url)
            try {
              let ext = url.substring(11, 14)
              if (ext === 'jpe') ext = 'jpg'

              let blobData = await fetchRes.blob()
              const fileURL = await writeFile(deck.slug, cardKey + '.' + ext, blobData, true)
              window.debugInfo.push('Wrote file - ' + fileURL)
              window.debugInfo.push(1)
              if (window.WkWebView) {
                deckData[cardKey].image = window.WkWebView.convertFilePath(fileURL)
                window.debugInfo.push(2)
              } else {
                deckData[cardKey].image = fileURL
                window.debugInfo.push(3)
              }
              window.debugInfo.push('Using file url - ' + deckData[cardKey].image)
            } catch(error) {
              console.log("could not save file", cardKey, error)
            }
          }
          await writeFile(deck.slug, filename, deckData)
        }
      }

      cards = state.isApp ? await readFile(deck.slug, filename) : localDecks[deck.slug]

      await dispatch('sortCards')

      commit('setDeck', deck)
    },
    async setLanguage({ commit, dispatch}, language) {
      commit('setLanguage', language)
      await dispatch('sortCards')
    },
    async sortCards ({ commit, state }, sortMethod) {
      if (sortMethod) {
        commit('setSortMethod', sortMethod)
      }
      if (state.sortMethod === 'alpha') {
        cards.sort((a, b) => {
          return a.words[state.learningLanguage].localeCompare(b.words[state.learningLanguage], 'es', {'sensitivity': 'base'})
        })
      } else if (state.sortMethod === 'shuffle') {
        shuffleArray(cards)
      } else if (state.sortMethod === 'leastViewed') {
        cards.sort((a, b) => {
          const aViewCount = state.questionViewCounts[a.question] || 0
          const bViewCount = state.questionViewCounts[b.question] || 0
          if (aViewCount > bViewCount) return 1
          if (aViewCount < bViewCount) return -1
          return a.words[state.learningLanguage].localeCompare(b.words[state.learningLanguage], 'es', {'sensitivity': 'base'})
        })
      }

      commit('setCardIdx', -1)
      await new Promise(r => setTimeout(r, 150))
      commit('setCardIdx', 0)
    }

  },
  modules: {
  },
  getters: {
    card (state) {
      const card = cards[state.cardIdx]
      if (!card) return []
      card.question = card.words[state.learningLanguage]
      card.answer = card.words[state.referenceLanguage]
      card.audio = card.audios[state.audioSlug]
      if (state.testMode) {
        const imageIdxs = [...Array(cards.length).keys()]
        imageIdxs.splice(state.cardIdx, 1)
        shuffleArray(imageIdxs)
        card.correctAnswerIdx = Math.floor(Math.random() * 4)
        card.answerOptions = []
        for (let idx=0; idx<4; idx++) {
          if (idx === card.correctAnswerIdx) {
            card.answerOptions.push(card.image)
          } else {
            const optionIdx = imageIdxs.pop()
            card.answerOptions.push(cards[optionIdx].image)
          }
        }
      } else {
        state.activeCardCount += 1
        state.globalCardCount += 1
        if (state.isApp && state.globalCardCount % 98 === 0 && state.activeCardCount > 7) {
          if (state.dialog === 'none' && state.rateUsDialogEnabled) {
            state.dialog = 'rateUs'
          }
        }
        if (!state.questionViewCounts[card.question]) state.questionViewCounts[card.question] = 0
        state.questionViewCounts[card.question]++
      }
      return [card]
    },
    deckList (state) {
      console.log('state.deckList', state.deckList)
      return state.deckList.map(deck => Object.assign({name: deck.titles[state.referenceLanguage], bestScore: 0}, deck))
    },
    learningLanguage (state) {
      return state.languages.find(language => language.slug === state.learningLanguage)
    },
    learningLanguages (state) {
      return state.languages.filter(language => language.learning)
    },
    cardProgress (state) { 
      return Math.ceil(state.cardIdx / (Object.keys(cards).length - 1) * 100)
    },
    score (state) {
      if (!state.scores.length) return 0
      return Math.round(state.scores.filter(score => score).length / state.scores.length * 100)

    }
  },
  plugins: [vuexLocal.plugin]
})
