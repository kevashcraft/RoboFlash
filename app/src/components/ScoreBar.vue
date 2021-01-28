<template>
  <v-container style="height: 45px; padding: 0 45px" class="score-bar">
    <v-row class="justify-space-between align-center fill-height">
      <div class="fire" v-show="streak > 0" :class="{ growing }">
        {{ streak }}
      </div>
    </v-row>
  </v-container>
</template>

<style scoped>
.fire {
  width: 60px;
  height: 40px;
  line-height: 58px;
  color: black;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 1px 1px 3px white;
  text-align: center;
  /* border: 1px dashed black; */
  background: url('../assets/fire-full.png');
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
}
.growing {
  background: url('../assets/fire.gif');
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
}
.score-bar {
  margin-top: env(safe-area-inset-top) !important;
}
</style>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ScoreBar',
  computed: {
    ...mapState([
      'streak'
    ]),
  },
  methods: {
  },
  watch: {
    streak () {
      if (this.streak) {
        this.growing = true
        setTimeout(() => {
          this.growing = false
        }, 2500)
      }
    }
  },

  data: () => ({
    growing: false,
    langs: {
    }    
  }),
}
</script>
