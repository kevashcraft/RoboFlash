<template>
  <v-container style="height: 55px; padding: 0 55px">
    <v-row class="justify-space-between align-center fill-height">
      <v-menu top :offset-y="true" :nudge-top="25" auto :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" color="blue" @click="langOptionGroup = false">
            <img :src="learningLanguage.icon" width="24">
            <span style="margin-left: 8px; color: white">{{ deck.name }}</span>
          </v-btn>
        </template>
        <v-list>

          <v-list-group v-model="langOptionGroup">
            <template v-slot:activator>
              <v-list-item-icon>
                <img :src="learningLanguage.icon" width="24">
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-subtitle>Learning</v-list-item-subtitle>
                <v-list-item-title v-text="learningLanguage.title"></v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="l in learningLanguages" :key="l.slug"
              @click="setLanguage(l.slug); langOptionGroup=false"
              :class="l.slug === learningLanguage.slug ? 'deck-selected' : ''">
              <v-list-item-icon>
                <img :src="l.icon" height="32">
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="l.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <v-subheader style="color: #2995fe"><strong>Available Cards</strong></v-subheader>
          <v-divider></v-divider>
          <v-list-item v-for="d in deckList" :key="d.name"
            @click="deckChange(d)"
            :class="d.slug === deck.slug ? 'deck-selected' : ''">
            <v-list-item-content>
              <v-list-item-title v-text="d.name" style="font-weight: 500"></v-list-item-title>
              <v-list-item-subtitle v-if="d.bestScore" :style="getBestScoreStyle(d.bestScore)">{{d.bestScore}}%</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon v-if="!d.downloaded">mdi-cloud-download</v-icon>
              <v-icon v-if="d.downloaded">mdi-check</v-icon>
            </v-list-item-icon>
          </v-list-item>

        </v-list>
      </v-menu>

      <v-menu :offset-y="true" :nudge-top="35" top :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-subheader style="color: #2995fe"><strong>App Settings</strong></v-subheader>
          <v-divider></v-divider>
          <v-list-group
            v-for="item in menu"
            :key="item.slug"
            v-model="item.active"
            :prepend-icon="item.icon"
            no-action
            >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
              </v-list-item-content>
            </template> 
            <v-list-item
              v-for="option in item.options"
              :key="option.slug"
              @click="optionAction(item.slug, option.slug)"
              :class="optionClass(item.slug, option.slug)"
              >
              <v-list-item-icon>
                <v-icon>{{option.icon}}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="option.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <v-subheader style="color: #2995fe"><strong>Audio / Theme / Tests</strong></v-subheader>
          <v-list-item @click="toggleAudioEnabled">
            <v-list-item-icon v-if="audioEnabled">
              <v-icon>mdi-volume-off</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-if="audioEnabled">Turn Audio Off</v-list-item-title>
            <v-list-item-icon v-if="!audioEnabled">
              <v-icon>mdi-volume-high</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-if="!audioEnabled">Turn Audio On</v-list-item-title>
          </v-list-item>
          <v-list-item @click="toggleDarkTheme">
            <v-list-item-icon>
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-show="darkTheme">Switch to Light Theme</v-list-item-title>
            <v-list-item-title v-show="!darkTheme">Switch to Dark Theme</v-list-item-title>
          </v-list-item>
          <v-list-item @click="toggleTestModeEnabled">
            <v-list-item-icon>
              <v-icon>mdi-ab-testing</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-show="testModeEnabled">Turn Tests Off</v-list-item-title>
            <v-list-item-title v-show="!testModeEnabled">Turn Tests On</v-list-item-title>
          </v-list-item>
          <v-list-item v-show="!testCompleteDialogEnabled" @click="enableTestDialog">
            <v-list-item-title>Reenable Test Complete Dialog</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item @click="showDebug">
            <v-list-item-title>Expand View</v-list-item-title>
          </v-list-item> -->
          <v-divider></v-divider>
          <v-divider></v-divider>
          <v-list-item @click="showLicenses">
            <v-list-item-title>Licenses</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </v-row>
  </v-container>
</template>

<style>
.deck-selected {
  background: rgb(0,0,0,.2)
}
</style>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'ActionBar',
  computed: {
    ...mapState([
      'audioEnabled', 'darkTheme',
      'testModeEnabled', 'testCompleteDialogEnabled',
      'showAnswers', 'showHints', 'sortMethod'
    ]),
    ...mapGetters(['deckList', 'learningLanguages', 'learningLanguage', 'deck'])
  },
  methods: {
    ...mapActions(['deckChange', 'sortCards', 'setLanguage']),
    ...mapMutations([
      'setShowAnswers', 'setShowHints',
      'toggleAudioEnabled', 'toggleDarkTheme',
      'toggleTestModeEnabled',
      'setGeneric'
    ]),
    showDebug () {
      this.$emit('showDebug')
    },
    showLicenses () {
      this.setGeneric({prop: 'dialog', value: 'licenses'})
    },
    optionAction (item, option) {
      if (item === 'sort') {
        this.sortCards(option)
      } else if (item === 'images') {
        this.setShowHints(option)
      } else if (item === 'answers') {
        this.setShowAnswers(option)
      }
    },
    optionClass (item, option) {
      if (item === 'sort') {
        return {
          'deck-selected': this.sortMethod === option
        }
      } else if (item === 'images') {
        return {
          'deck-selected': this.showHints === option
        }
      } else if (item === 'answers') {
        return {
          'deck-selected': this.showAnswers === option
        }
      }
    },
    getBestScoreStyle(bestScore) {
      if (!bestScore) return {}
      if (bestScore < 60) {
        return {color:  'red'}
      } 
      if (bestScore < 80) {
        return {color:  'orange'}
      } 
      if (bestScore < 100) {
        return {color:  'yellow'}
      } 
      return {color:  'blue'}
    },
    enableTestDialog () {
      this.setGeneric({prop: 'testCompleteDialogEnabled', value: true})
    },
  },

  data: () => ({
    langOptionGroup: false,
    menu: [
      {
        title: 'Sort Cards',
        slug: 'sort',
        icon: 'mdi-sort-reverse-variant',
        active: false,
        options: [
          {
            title: 'Alphabetical',
            slug: 'alpha',
            icon: 'mdi-sort-alphabetical-ascending-variant'
          }, {
            title: 'Least Viewed',
            slug: 'leastViewed',
            icon: 'mdi-sort-ascending'
          }, {
            title: 'Shuffle',
            slug: 'shuffle',
            icon: 'mdi-shuffle-variant'
          }
        ]
      }, {
        title: 'Show Images',
        slug: 'images',
        icon: 'mdi-tooltip-image',
        active: false,
        options: [
          {
            title: 'Always Show',
            slug: 'always',
            icon: 'mdi-pin-outline'
          }, {
            title: 'Show on Tap',
            slug: 'onTap',
            icon: 'mdi-gesture-tap'
          }, {
            title: 'Never Show',
            slug: 'never',
            icon: 'mdi-eye-off-outline'
          }
        ]
      }, {
        title: 'Show Answers',
        slug: 'answers',
        icon: 'mdi-forum',
        active: false,
        options: [
          {
            title: 'Always Show',
            slug: 'always',
            icon: 'mdi-pin-outline'
          }, {
            title: 'Show on Tap',
            slug: 'onTap',
            icon: 'mdi-gesture-tap'
          }, {
            title: 'Never Show',
            slug: 'never',
            icon: 'mdi-eye-off-outline'
          }
        ]
      }
    ]
    
  }),
}
</script>
