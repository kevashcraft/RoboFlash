<template>
  <v-dialog v-model="opened" max-width="450px" persistent>
    <v-card elevation="4" outlined>
      <v-card-title class="justify-center">
        <span>{{ langs.title[referenceLanguage] }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <img src="@/assets/rate-us-robot.png">
          </v-col>
          <v-col cols="8" style="font-size: 18px">
            <p v-show="!reviewing">{{ langs.areYouEnjoying[referenceLanguage] }}</p>
            <p v-show="reviewing">{{ langs.pleaseGoodReview[referenceLanguage] }}</p>
          </v-col>
        </v-row>
        <v-row v-show="!reviewing" class="justify-space-around" style="margin-top: 25px">
          <v-btn text @click="gotoFeedback">{{ langs.no[referenceLanguage] }}</v-btn>
          <v-btn raised color="primary" @click="rateUs">{{ langs.no[referenceLanguage] }}</v-btn>
        </v-row>
        <v-row v-show="reviewing" class="justify-end" style="margin-top: 25px">
          <v-btn raised color="primary" @click="allDone">{{ langs.thanks[referenceLanguage] }}</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

/* global cordova */

export default {
  name: 'RateUsDialog',

  computed: {
    ...mapState(['isApp', 'androidApp', 'iOSApp', 'dialog', 'referenceLanguage', 'rateUsDialogEnabled']),
  },

  watch: {
    dialog (dialog) {
      if (!this.rateUsDialogEnabled) {
        this.opened = dialog === 'rateUs'
      }
    },
    opened (opened) {
      if (!opened) {
        if (this.dialog === 'rateUs') {
          this.setGeneric({prop: 'dialog', value: 'none'})
        }
      } else {
        this.reviewing = false
      }
    }
  },

  methods: {
    ...mapMutations(['setGeneric']),
    rateUs () {
      this.reviewing = true
      cordova.plugins.AppReview.requestReview().catch(() => {
        return cordova.plugins.AppReview.openStoreScreen()
      })
      this.setGeneric({prop: 'rateUsDialogEnabled', value: false })
    },
    gotoFeedback () {
      this.setGeneric({prop: 'rateUsDialogEnabled', value: false })
      this.setGeneric({prop: 'dialog', value: 'feedback' })
    },
    allDone () {
      this.setGeneric({prop: 'rateUsDialogEnabled', value: false })
      this.setGeneric({prop: 'snackbar', value: this.langs.snackbar[this.referenceLangauge] })
    }
  },

  data: () => ({
    opened: false,
    reviewing: false,
    langs: {
      title: {
        en: 'App Review',
        es: 'Revisión de la Aplicación',
        ko: '앱 리뷰'
      },
      areYouEnjoying: {
        en: 'Are you enjoying this app?',
        es: '¿Estás disfrutando de esta aplicación?',
        ko: '이 앱이 마음에 드십니까?'
      },
      no: {
        en: 'no',
        es: 'no',
        ko: '아니'
      },
      yes: {
        en: 'yes',
        es: 'sí',
        ko: '예'
      },
      pleaseGoodReview: {
        en: 'Please give us a good review so we can keep growing!',
        es: '¡Danos una buena reseña para que podamos seguir creciendo!',
        ko: '우리가 계속 성장할 수 있도록 좋은 리뷰를 남겨주세요!'
      },
      thanks: {
        en: 'Thanks!',
        es: '¡Gracias!',
        ko: '감사!'
      },
      snackbar: {
        en: 'Thanks for the review!',
        es: '¡Gracias por la reseña!',
        ko: '검토해 주셔서 감사합니다!'
      }
    }
  }),


}
</script>
