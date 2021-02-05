<template>
  <v-container style="height: 45px; padding: 0 45px" class="score-bar">
    <v-row class="justify-space-between align-center fill-height">
      <FireStreak />
    </v-row>
  </v-container>
</template>

<style scoped>
.score-bar {
  margin-top: env(safe-area-inset-top) !important;
}
</style>

<script>
import FireStreak from './FireStreak'

export default {
  name: 'ScoreBar',
  components: {
    FireStreak
  }
}
</script>
