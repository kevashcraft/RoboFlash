<template>
  <v-dialog v-model="opened" max-width="450px" persistent>
    <v-card elevation="4" outlined>
      <v-btn icon style="position: absolute; top: 15px; right: 15px" @click="opened=false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-card-title class="justify-center">
        <span>Feedback</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-img src="@/assets/rate-us-robot.png" max-height="80px" contain></v-img>
          </v-col>
          <v-col cols="12">
            <p>
              Send us a message. Tell us what's on your mind. Include contact info if you want a response.
            </p>
          </v-col>
          <v-col cols="12" style="font-size: 18px">
            <v-form @submit.prevent="submitFeedback">
              <v-container>
                <v-textarea v-model="feedback" autofocus label="Please tell us what you think"></v-textarea>
                <v-row class="justify-space-between" style="margin-top: 15px">
                  <v-btn @click="opened=false" text>Close</v-btn>
                  <v-btn color="green" type="submit" raised>Send</v-btn>
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
    ...mapState(['dialog']),
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
      this.setGeneric({prop: 'snackbar', value: 'Thanks for your feedback!'})
      await firebase.write({message: this.feedback, meta: {
        card: this.card[0].question,
        deck: this.deck.name
      }})
      this.feedback = ''
    }
 },

  data: () => ({
    opened: false,
    feedback: ''
  }),


}
</script>
