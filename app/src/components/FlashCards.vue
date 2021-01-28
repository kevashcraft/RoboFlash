<template>
  <v-container style="padding: 0; position: relative;">
    <transition-group v-if="!iOSApp" name="list" class="card_container" tag="div">
      <FlashCard v-for="c in card" :key="c.idx" :card="c" />
    </transition-group>
    <div v-if="iOSApp">
      <FlashCard v-for="c in card" :key="c.idx" :card="c" />
    </div>
  </v-container>
</template>
<style lang="scss">
.card_container {
  position: absolute;
  top: 5px;
  right: 15px;
  bottom: 5px;
  left: 15px;
}
.list-item {
  // display: block;
  // height: 300px;
  // width: 200px;
  /* border: 1px solid pink; */
  /* margin-right: 10px; */
}
.list-leave-active {
  transition: all .5s;
}
.list-enter-active {
  transition: all .3s;
}
.list-enter {
  opacity: 0;
}
.list-leave-to {
  opacity: 0;
}
/* .list-enter {
  transform: translateY(600px);
} */
.list-leave-to {
  transform: translateX(-600px);
}
.list-leave-active {
  position: absolute;
  // height: 100%;
  // width: 100%
}

</style>

<script>
import FlashCard from './FlashCard'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'FlashCards',
  components: { FlashCard },

  computed: {
    ...mapGetters(['card']),
    ...mapState(['iOSApp'])
  }
}
</script>
