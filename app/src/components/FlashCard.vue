<template>
  <v-container ref="card" class="elevation-6" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0" @click="action">
    <span v-if="testMode" style="position: absolute; top: 15px; left: 15px; color: rgba(255, 0, 0, .80); font-weight: bold">Test</span>
    <v-btn icon v-if="!testMode && cardIdx > 0" style="position: absolute; top: 15px; left: 15px" @click="prevCard">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-btn text x-small rounded outlined v-if="!testMode" style="position: absolute; top: 15px; left:50%; width: 100px; margin-left:-50px" @click="feedback">
      {{ langs.feedback[referenceLanguage] }}
    </v-btn>
    <v-btn icon v-if="!testMode" style="position: absolute; top: 15px; right: 15px" @click="play">
      <v-icon>mdi-volume-high</v-icon>
    </v-btn>
    <v-btn text v-if="testMode" style="position: absolute; top: 15px; right: 15px; opacity: .4" @click="skipTest">
      {{ langs.skip[referenceLanguage] }}
      <v-icon right color="blue">mdi-arrow-right</v-icon>
    </v-btn>
    <v-row class="flex-column fill-height" dense>
      <v-row class="flex-grow-0 justify-center align-end question">
        <p :class="{'smaller-text': hasBigWord(card.question)}">{{ card.question }}</p>
      </v-row>
      <v-row v-if="!testMode" class="flex-grow-0 flex-shrink-1 justify-center align-center image">
        <v-img :class="{blurredimg: blurHint}" v-show="!hideHint" :src="card.image" contain draggable="false" style="max-width: 80%; max-height: 80%"></v-img>
      </v-row>
      <v-row v-if="testMode" class="flex-grow-1 justify-center align-center">
        <v-col cols="6" class="test-images" v-for="(image, idx) in card.answerOptions" :key="idx" @click="guess(idx)">
          <v-img :src="image" draggable="false" class="test-image"></v-img>
        </v-col>
      </v-row>
      <v-row v-if="!testMode" class="flex-grow-0 justify-center align-start answer">
        <p v-show="!hideAnswer" :class="{blurred: blurAnswer}">{{ card.answer }}</p>
      </v-row>
    </v-row>
    <audio :src="card.audio" ref="audio"></audio>
    <audio preload="auto" src="@/assets/wrong.mp3" ref="wrong"></audio>
    <audio preload="auto" src="@/assets/right.mp3" ref="right"></audio>
  </v-container>
</template>

<style lang="scss" scoped>
.question {
  height: 20%;
  p {
    text-transform: lowercase;
    line-height: 3.5rem;
    font-size: 3.5rem;
    margin: 15px;
    font-weight: bold;
    text-align: center;
    user-select: none;
  }
}
.smaller-text {
  font-size: 3rem !important;
}
.image {
  display: flex;
  user-select: none;
  // flex: 1;
  height: 60%;
  width: 100%;
  margin: 0 auto;
  // border: 2px dashed red;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // img {
  //   margin: 25px 0;
  // }
}
.test-images {
  display: flex;
  user-select: none;
  // flex: 1;
  // height: 60%;
  width: 40%;
  // border: 2px dashed red;
  // flex-direction: column;
  justify-content: center;
  position: relative;
  align-content: center;
  .test-image {
    max-height: 150px;
    max-width: 150px;
    // margin: 25px 0;
    @media (min-width: 600px) {
      max-width: 200px;
    }
    @media (min-width: 800px) {
      max-width: 250px;
    }
    @media (min-height: 600px) {
      max-height: 200px;
    }
    @media (min-height: 800px) {
      max-height: 250px;
    }
  }
}
.answer {
  height: 20%;
  p {
    text-transform: lowercase;
    font-size: 2.5rem;
    margin: 15px 0;
    font-weight: bold;
    user-select: none;
  }
}
.blurred {
  color: transparent;
  text-shadow: 0 0 15px rgba(0,0,0,0.5);
}
.blurredimg {
  opacity: .3;
  filter: blur(25px);
}

</style>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'FlashCard',
  props: {
    card: Object
  },
  computed: mapState(['audioEnabled', 'cardIdx', 'showHints', 'showAnswers', 'activeCardCount', 'testMode', 'referenceLanguage']),
  watch: {
    audioEnabled (enabled) {
      if (!enabled) {
        this.$refs['audio'].pause()
      }
    },
    showAnswers (showAnswers) {
      this.blurAnswer = showAnswers === 'onTap'
      this.hideAnswer = showAnswers === 'never'
    },

    showHints (showHints) {
      this.blurHint = showHints === 'onTap'
      this.hideHint = showHints === 'never'
    }
  },
  mounted () {
    if (this.audioEnabled) {
      this.$refs['audio'].play()
    }
    this.blurAnswer = this.showAnswers === 'onTap'
    this.hideAnswer = this.showAnswers === 'never'
    this.blurHint = this.showHints === 'onTap'
    this.hideHint = this.showHints === 'never'
  },
  beforeDestroy () {
    this.$refs['audio'].pause()
  },
  methods: {
    ...mapMutations(['addScore', 'nextCard', 'prevCard', 'setGeneric']),
    play (event) {
      event.stopPropagation()
      this.$refs['audio'].play()
    },
    feedback (event) {
      event.stopPropagation()
      this.setGeneric({prop: 'dialog', value: 'feedback'})
    },
    action () {
      if (this.testMode) return
      if (this.blurHint && this.showHints === 'onTap') {
        this.blurHint = false
      } else if (this.blurAnswer && this.showAnswers === 'onTap') {
        this.blurAnswer = false
      } else {
        this.nextCard()
      }
    },
    async guess (guessIdx) {
      const correctAnswer = guessIdx === this.card.correctAnswerIdx
      if (correctAnswer) {
        this.$refs['card'].style.backgroundColor = 'rgba(0, 255, 0, .6)'
        if (this.audioEnabled) {
          this.$refs['right'].play()
        }
      } else {
        this.$refs['card'].style.backgroundColor = 'rgba(255, 0, 0, .6)'
        if (this.audioEnabled) {
          this.$refs['wrong'].play()
        }
      }

      await new Promise(r => setTimeout(r, 150))
      this.addScore(correctAnswer)
      this.nextCard()
    },
    hasBigWord(text) {
      return text.length > 15 || text.split(' ').some(w => w.length > 10)
    },
    skipTest () {
      this.setGeneric({prop: 'testMode', value: false})
      this.setGeneric({prop: 'cardIdx', value: 0})
    }
  },
  data: () => ({
    blurAnswer: false,
    hideAnswer: false,
    blurHint: false,
    hideHint: false,
    langs: {
      feedback: {
        en: 'Feedback',
        es: 'Comentarios',
        ko: '피드백'
      },
      skip: {
        en: 'Skip',
        es: 'Omitir',
        ko: '건너 뛰기'
      }
    }
  }),
}
</script>
