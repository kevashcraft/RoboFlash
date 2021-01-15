<template>
  <v-app>
    <v-container class="fill-height" style="padding: 0; max-width: 768px">
      <v-row class="fill-height flex-column">
        <ScoreBar class="flex-grow-0" />
        <FlashCards class="flex-grow-1 flashcards" />
        <ProgressBars class="flex-grow-0" />
        <ActionBar class="flex-grow-0" @showDebug="showDebug" />
        <!-- <ActionBar class="flex-grow-0" @deckSelected="showDebug()"/> -->
      </v-row>
    </v-container>
    <ConfirmDownload />
    <DownloadProgress />
    <WelcomeDialog />
    <FirstTestDialog />
    <TestCompleteDialog />
    <LicensesDialog />
    <RateUsDialog />
    <FeedbackDialog />
    <AppDownloadSnackbar />
    <MainSnackbar />
    <v-dialog v-model="showDebugDialog" max-width="350px">
      <v-card outlined elevation="6">
        <v-card-title>Expanded View</v-card-title>
        <v-card-text>
          <p v-html="debugInfo"></p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style lang="scss">
.flashcards {
  @media (min-height: 1200px) {
    margin-top: 45px;
  }
}

</style>

<script>
import ActionBar from './components/ActionBar'
import ScoreBar from './components/ScoreBar'
import FlashCards from './components/FlashCards'
import ProgressBars from './components/ProgressBars'
import ConfirmDownload from './components/ConfirmDownload'
import DownloadProgress from './components/DownloadProgress'
import WelcomeDialog from './components/WelcomeDialog'
import FirstTestDialog from './components/FirstTestDialog'
import TestCompleteDialog from './components/TestCompleteDialog'
import LicensesDialog from './components/LicensesDialog'
import RateUsDialog from './components/RateUsDialog'
import FeedbackDialog from './components/FeedbackDialog'
import AppDownloadSnackbar from './components/AppDownloadSnackbar'
import MainSnackbar from './components/MainSnackbar'

import { mapMutations, mapState } from 'vuex'
import moment from 'moment'

import firebase from './plugins/firebase'

/* global device */

export default {
  name: 'App',

  components: {
    ActionBar,
    ScoreBar,
    FlashCards,
    ProgressBars,
    ConfirmDownload,
    DownloadProgress,
    WelcomeDialog,
    FirstTestDialog,
    TestCompleteDialog,
    LicensesDialog,
    RateUsDialog,
    FeedbackDialog,
    AppDownloadSnackbar,
    MainSnackbar
  },

  data: () => ({
    showDebugDialog: false,
    debugInfo: ''
  }),
  computed: mapState(['isApp', 'darkTheme']),

  watch: {
    darkTheme () {
      this.$vuetify.theme.dark = this.darkTheme
    }
  },

  async mounted () {
    window.debugInfo = []
    this.$store.commit('setDownloadProgress', -1)
    this.$store.commit('setProposedDeck', {})
    this.$store.commit('setDialog', 'none')
    this.$store.commit('setGeneric', {prop: 'snackbar', value: ''})
    setTimeout(() => {
      if (!this.$store.state.welcomeDialogDisplayed) {
        this.$store.commit('setDialog', 'welcome')
      }
    }, 500)

    try {
        const daydiff = moment().diff(moment(this.$store.state.prevActiveDate), 'days')
        console.log('daydiff', daydiff)
        if (daydiff === 1) {
          this.setGeneric({prop: 'streak', value: this.$store.state.streak + 1})
        } else {
          this.setGeneric({prop: 'streak', value: 1 })
          this.$store.commit('resetActiveCardCount')
        }
    } catch (error) {
      console.log('error with app.vue prevactivedate check', error)
      this.$store.commit('resetActiveCardCount')
    }
    this.$store.commit('setPrevActiveDate', moment().format('YYYY-MM-DD'))

    await this.$store.dispatch('getDeckList')

    if (this.isApp) {
      document.addEventListener('deviceReady', this.init)
    } else {
      this.init()
    }
  },

  methods: {
    ...mapMutations(['setGeneric']),
    showDebug () {
      this.debugInfo = window.debugInfo.join('<br>')
      this.showDebugDialog = true
    },
    async init () {
      this.$store.commit('setGeneric', {prop: 'isApp', value: !!window.cordova})
      this.$store.commit('setGeneric', {prop: 'androidApp', value: device.platform === 'Android'})
      this.$store.commit('setGeneric', {prop: 'iOSApp', value: device.platform === 'iOS'})

      firebase.init()
      const userAgent = navigator.userAgent.toLowerCase();
      window.debugInfo.push('userAgent - ' + userAgent)
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      window.debugInfo.push('isTablet - ' + isTablet)
      if (this.isApp && !isTablet) {
        window.screen.orientation.lock('portrait')
        window.debugInfo.push('unlocked')
      }
      window.debugInfo.push('orientationType2')
      window.debugInfo.push('orientationType - ' + window.screen.orientation.type)

      if (!this.$store.state.deck.slug) {
          for (let idx=0; idx<5; idx++) {
          const deck = this.$store.state.deckList[idx]
          if (deck.type === 'gifs') continue
          await this.$store.dispatch('deckChange', deck)
          break
        }
      } else {
        this.$store.commit('initDeckDownloaded')
        await this.$store.dispatch('deckChange', this.$store.state.deck)
      }
    }
  }

};
</script>
