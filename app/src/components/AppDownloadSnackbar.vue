<template>
  <v-snackbar v-model="opened" :timeout="-1" :right="true">
    <v-row class="justify-center align-center" style="position: relative">
      <div style="font-size: 19px">Download the App</div>
      <v-btn icon @click="opened=false" style="position: absolute; top: -5px; right: -5px">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-row>
    <v-row class="justify-center">
      <a href="https://play.google.com/store/apps/details?id=com.logicdudes.robot_flash" target="_blane">
        <img src="@/assets/google-play-badge.png" width="200">
      </a>
    </v-row>
    <v-row class="justify-center">
      <a href="https://apps.apple.com/us/app/roboflash/id1547172369" target="_blane">
        <img src="@/assets/app-store-badge.png" width="175">
      </a>
    </v-row>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AppDownloadSnackbar',

  computed: mapState(['isApp']),

  mounted () {
    console.log('window.screen.width', window.screen.width)
    if (window.screen.width > 1200) {
      setTimeout(() => {
        if (!this.isApp) {
          this.opened = true
        }
      }, 45000)
    }
  },

  data: () => ({
    opened: false
  }),


}
</script>
