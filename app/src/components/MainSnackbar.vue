<template>
  <v-snackbar v-model="opened" top shaped :timeout="snackbarTimeout">
    <v-row>
      <v-img src="@/assets/rate-us-robot.png" style="margin: 0 10px"  max-width="32px"></v-img>
      <span style="margin-left: 15px; font-weight: bold">{{snackbar}}</span>
    </v-row>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'MainSnackbar',

  computed: {
    ...mapState(['snackbar', 'snackbarTimeout'])
  },

  watch: {
    snackbar (snackbar) {
      this.opened = !!snackbar
    },
    opened (opened) {
      if (!opened) {
        this.setGeneric({prop: 'snackbar', value: ''})
        this.setGeneric({prop: 'snackbarTimeout', value: 3500})
      }
    }
  },

  methods: mapMutations(['setGeneric']),

  data: () => ({
    opened: false
  }),


}
</script>
