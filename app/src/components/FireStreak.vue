<template>
  <div class="fire" :class="{ growing }" v-show="showing">
    {{ streak }}
  </div>
</template>

<style scoped>
.fire {
  width: 60px;
  height: 40px;
  /* opacity: 0; */
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
.showing {
  opacity: 1;
}
</style>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FireStreak',
  computed: {
    ...mapState([
      'streak'
    ]),
    showing () {
      return this.streak > 0
    }
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
