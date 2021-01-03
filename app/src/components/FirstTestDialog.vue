<template>
  <v-dialog v-model="opened" max-width="450px" persistent>
    <v-card elevation="4" outlined>
      <v-card-title class="justify-center">
        <span>{{ langs.tet[referenceLanguage] }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4" style="position: relative">
            <img src="@/assets/test-robot.png" style="max-width: 95%">
          </v-col>
          <v-col cols="8" style="font-size: 18px">
            <p>{{ langs.gryf[referenceLanguage]}}</p>
            <p>
              <strong>{{ langs.ctciS[referenceLanguage]}}</strong>. {{ langs.ctci[referenceLanguage]}}
            </p>
          </v-col>
        </v-row>
        <v-row class="justify-center">
          <p style="font-size: 18px">{{ langs.tphl[learningLanguage]}}</p>
        </v-row>
        <v-row class="justify-center" style="margin-top: 25px">
          <v-btn raised color="primary" @click="opened=false">{{ langs.leg[referenceLanguage]}}</v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'FirstTestDialog',

  computed: mapState(['dialog', 'learningLanguage', 'referenceLanguage']),

  watch: {
    dialog (dialog) {
      this.opened = dialog === 'firstTest'
    },
    opened (opened) {
      if (!opened) {
        this.setGeneric({prop: 'firstTestDialogDisplayed', value: true})
        this.setGeneric({prop: 'dialog', value: 'none'})
      }
    }
  },

  methods:  mapMutations(['setGeneric']),

  data: () => ({
    opened: false,
    langs: {
      tet: {
        en: 'Test Time',
        es: 'Tiempo de Prueba',
        ko: '테스트 시간'
      },
      gryf: {
        en: 'Get ready, this is your first test.',
        es: 'Prepárate, esta es tu primera prueba.',
        ko: '준비하세요. 이것이 첫 번째 테스트입니다.'
      },
      ctciS: {
        en: 'Click the correct image for the word',
        es: 'Haga clic en la imagen correcta para la palabra',
        ko: '단어에 대한 올바른 이미지를 클릭하십시오.' 
      },
      ctci: {
        en: 'Your score is next to the progress bar.',
        es: 'Tu puntuación está junto a la barra de progreso.',
        ko: '점수는 진행률 표시 줄 옆에 있습니다.'
      },
      tphl: {
        en: 'You can do it!',
        es: '¡tú puedes hacerlo!',
        ko: '넌 할 수있어!'
      },
      leg: {
        en: "Let's Go!",
        es: 'Vamonos',
        ko: '가자' 
      }
    }
  }),


}
</script>
