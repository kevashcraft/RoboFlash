<template>
  <v-dialog v-model="opened" max-width="450px">
    <v-card elevation="4" outlined>
      <v-card-title class="justify-center">
        <span>{{ langs.welcome[learningLanguage] }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4" style="position: relative">
            <img src="@/assets/robot-s.png" style="max-width: 95%">
          </v-col>
          <v-col cols="8">
            <p>{{ langs.haw[referenceLanguage] }} </p>
            <p>{{ langs.had[referenceLanguage] }} <strong>{{ langs.afap[referenceLanguage] }}</strong></p>
          </v-col>
        </v-row>
        <v-row class="justify-center" style="margin-top: 25px">
          <v-btn raised color="primary" @click="ackWelcomed()">Let's Go</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'WelcomeDialog',

  computed: mapState(['dialog', 'learningLanguage', 'referenceLanguage']),

  watch: {
    dialog (dialog) {
      this.opened = dialog === 'welcome'
    }
  },

  methods: {
    ...mapMutations(['setGeneric']),
    ackWelcomed() {
      this.setGeneric({prop: 'welcomeDialogDisplayed', value: true})
      this.setGeneric({prop: 'dialog', value: 'none'})
    }
  },

  data: () => ({
    opened: false,
    langs: {
      welcome: {
        en: 'Welcome!',
        es: '¡Bienvenidos!',
        ko: '어서 오십시오!'
      },
      haw: {
        en: 'Hello and welcome to RoboFlash!',
        es: '¡Hola y bienvenido a RoboFlash!',
        ko: '안녕하세요, RoboFlash에 오신 것을 환영합니다!'
      },
      had: {
        en: 'This is a fast-paced tool to help you learn foreign vocab',
        es: 'Esta es una herramienta de ritmo rápido para ayudarlo a aprender vocabulario extranjero',
        ko: '이것은 외국 어휘를 배우는 데 도움이되는 빠르게 진행되는 도구입니다',
      },
      afap: {
        en: 'as fast as possible!',
        es: '¡tan rápido como sea posible!',
        ko: '최대한 빨리!',
      }
    }
  }),


}
</script>
