<template>
  <v-container style="height: 45px; padding: 0 45px">
    <v-row class="justify-space-between align-center fill-height">
      <div class="fire">
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

  data: () => ({
    langs: {
    }    
  }),
}
</script>
