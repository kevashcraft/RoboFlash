<template>
  <v-dialog v-model="opened" max-width="450px">
    <v-card elevation="4" outlined>
      <v-card-title class="justify-center">
        <span>{{ langs.welcome[learningLanguage] }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4" class="d-flex justify-center">
            <v-img src="@/assets/robot-s.png" contain></v-img>
          </v-col>
          <v-col cols="8" class="d-flex align-center">
            <p style="font-size: 18px; line-height: 28px">
              <strong>{{ langs.haw[referenceLanguage] }}</strong> {{ langs.had[referenceLanguage] }} <strong>{{ langs.afap[referenceLanguage] }}</strong>
            </p>
          </v-col>
        </v-row>
        <v-row class="flex-column" style="padding: 0 25px" dense no-gutters>
          <p style="font-size: 16px;">{{ langs.selectTheLangYouKnow[referenceLanguage] }}</p>
          <v-select dense :items="learningLanguages" background-color="green" rounded v-model="referenceLanguageLocal" item-value="slug">
            <template v-slot:selection="{ item }">
                <img :src="item.icon" style="max-height: 24px; margin-right: 15px; margin: 10px"><span style="color: white">{{ item.title }}</span>
            </template>
            <template v-slot:item="{ item }">
                <img :src="item.icon" style="max-height: 24px; margin-right: 15px">{{ item.title }}
            </template>
          </v-select>
        </v-row>
        <v-row class="justify-center">
          <v-icon style="margin: 0 15px">mdi-transfer-down</v-icon>
          <v-icon style="margin: 0 15px">mdi-transfer-down</v-icon>
          <v-icon style="margin: 0 15px">mdi-transfer-down</v-icon>
        </v-row>
        <v-row class="flex-column" style="padding: 15px 25px 0" dense no-gutters>
          <p style="font-size: 16px;">{{ langs.selectTheLangYouWant[referenceLanguage] }}</p>
          <v-select dense :items="learningLanguages" background-color="blue" rounded v-model="learningLanguageLocal" item-value="slug">
            <template v-slot:selection="{ item }">
                <img :src="item.icon" style="max-height: 24px; margin-right: 15px; margin: 10px"><span style="color: white">{{ item.title }}</span>
            </template>
            <template v-slot:item="{ item }">
                <img :src="item.icon" style="max-height: 24px; margin-right: 15px">{{ item.title }}
            </template>
          </v-select>
        </v-row>
        <v-row class="justify-center" style="margin-top: 25px">
          <v-btn x-large raised color="primary" @click="ackWelcomed()">Let's Go</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.v-label {
  padding: 15px
}
</style>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'WelcomeDialog',

  computed: {
    ...mapState(['dialog', 'learningLanguage', 'referenceLanguage']),
    ...mapGetters(['learningLanguages'])
  },

  watch: {
    dialog (dialog) {
      this.opened = dialog === 'welcome'
    },
    opened (opened) {
      if (!opened) {
        if (this.dialog === 'welcome') {
          this.setGeneric({prop: 'dialog', value: 'none'})
        }
      }
      if (opened) {
        this.learningLanguageLocal = this.learningLanguage
        this.referenceLanguageLocal = this.referenceLanguage
      }
    },
    learningLanguage (language) {
      if (language && this.learningLanguageLocal !== language) {
        this.learningLanguageLocal = language
      }
    },
    learningLanguageLocal (language) {
      if (language && this.learningLanguage !== language) {
        this.setLanguage(language)
      }
    },
    referenceLanguage (language) {
      if (language && this.referenceLanguageLocal !== language) {
        this.referenceLanguageLocal = language
      }
    },
    referenceLanguageLocal (language) {
      if (language && this.referenceLanguage !== language) {
        this.setGeneric({prop: 'referenceLanguage', value: language})
      }
    }
  },

  methods: {
    ...mapActions(['setLanguage']),
    ...mapMutations(['setGeneric']),
    ackWelcomed() {
      this.setGeneric({prop: 'welcomeDialogDisplayed', value: true})
      this.setGeneric({prop: 'dialog', value: 'none'})
    }
  },

  data: () => ({
    opened: false,
    learningLanguageLocal: null,
    referenceLanguageLocal: null,
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
      },
      selectTheLangYouKnow: {
        en: 'Select the language that you already know',
        es: 'Seleccione el idioma que ya conoce',
        ko: '이미 알고있는 언어를 선택하세요.',
      },
      selectTheLangYouWant: {
        en: 'Select the language that you want to learn',
        es: 'Seleccione el idioma que desea aprender',
        ko: '배우고 싶은 언어를 선택하세요',
      }
    }
  }),


}
</script>
