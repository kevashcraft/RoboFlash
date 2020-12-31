<template>
  <v-dialog v-model="opened" max-width="450px" persistent>
    <v-card elevation="4" outlined>
      <v-btn icon style="position: absolute; top: 15px; right: 15px" @click="opened=false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-card-title class="justify-center">
        <span>{{langs.feedback[referenceLanguage]}}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-img src="@/assets/rate-us-robot.png" max-height="80px" contain></v-img>
          </v-col>
          <v-col cols="12">
            <p>
              {{langs.sum[referenceLanguage]}}
            </p>
          </v-col>
          <v-col cols="12" style="font-size: 18px">
            <v-form @submit.prevent="submitFeedback">
              <v-container>
                <v-textarea v-model="feedback" autofocus label="Please tell us what you think"></v-textarea>
                <v-row class="justify-space-between" style="margin-top: 15px">
                  <v-btn @click="opened=false" text>{{langs.close[referenceLanguage]}}</v-btn>
                  <v-btn color="green" type="submit" raised>{{langs.send[referenceLanguage]}}</v-btn>
                </v-row>
              </v-container>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import firebase from '@/plugins/firebase'

export default {
  name: 'FeedbackDialog',

  computed: {
    ...mapState(['dialog', 'referenceLanguage']),
    ...mapGetters(['card', 'deck'])
  },

  mounted () {
  },

  watch: {
    dialog (dialog) {
      this.opened = dialog === 'feedback'
    },
    opened (opened) {
      if (!opened && this.dialog === 'feedback') {
        this.setGeneric({prop: 'dialog', value: 'none'})
      }
    }
  },

  methods: {
    ...mapMutations(['setGeneric']),
    async submitFeedback() {
      this.opened = false      
      this.setGeneric({prop: 'snackbar', value: this.langs.tfyf[this.referenceLanguage]})
      await firebase.write({message: this.feedback, meta: {
        card: this.card[0].question,
        deck: this.deck.name
      }})
      this.feedback = ''
    }
 },

  data: () => ({
    opened: false,
    feedback: '',
    langs: {
      feedback: {
        en: 'Feedback',
        es: 'Comentarios',
        ko: '피드백'
      },
      sum: {
        en: "Send us a message. Tell us what's on your mind. Include contact info if you want a response.",
        es: "Mandanos un mensaje. Cuéntanos qué tienes en mente. Incluya información de contacto si desea una respuesta.",
        ko: "메시지를 보내주세요. 당신의 생각을 알려주세요. 답변을 원하면 연락처 정보를 포함하세요."
      },
      close: {
        en: 'Close',
        es: 'Cerrar',
        ko: '닫기'
      },
      send: {
        en: 'Send',
        es: 'Enviar',
        ko: '보내다'
      },
      tfyf: {
        en: 'Thanks for your feedback!',
        es: '¡Gracias por tus comentarios!',
        ko: '의견을 보내 주셔서 감사합니다!'
      }

    }
  }),


}
</script>
