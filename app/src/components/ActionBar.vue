<template>
  <v-container style="height: 65px; padding: 0 35px" class="action-bar">
    <v-row class="justify-space-between align-center fill-height">

      <v-col cols="2" class="d-flex justify-start" v-if="streak > 0">
        <FireStreak style="margin-top: -5px" />
      </v-col>

      <v-col :cols="streak > 0 ? 8 : 10" class="d-flex" :class="{'justify-center': streak > 0, 'justify-start': streak === 0 }">
        <v-menu top :offset-y="true" :nudge-top="25" :close-on-content-click="false" v-model="deckMenuOpened">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" color="blue" @click="langOptionGroup = false">
              <img :src="learningLanguage.icon" style="max-width: 24px">
              <span style="margin-left: 8px; color: white">{{ deck.name }}</span>
            </v-btn>
          </template>
          <v-list>

            <v-list-group v-model="langOptionGroup">
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-img :src="learningLanguage.icon" max-width="24" contain></v-img>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>{{langs.learning[referenceLanguage]}}</v-list-item-subtitle>
                  <v-list-item-title v-text="learningLanguage.title"></v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item v-for="l in learningLanguages" :key="l.slug"
                @click="setLanguage(l.slug); langOptionGroup=false"
                :class="l.slug === learningLanguage.slug ? 'deck-selected' : ''">
                <v-list-item-icon>
                  <img :src="l.icon" style="max-height: 32px">
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="l.title"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <v-subheader style="color: #2995fe"><strong>{{langs.avc[referenceLanguage]}}</strong></v-subheader>
            <v-divider></v-divider>
            <v-list-item v-for="d in deckList" :key="d.name"
              @click="deckChange(d); deckMenuOpened=false"
              :class="d.slug === deck.slug ? 'deck-selected' : ''">
              <v-list-item-content>
                <v-list-item-title style="font-weight: 500"><span style="margin-right:3px">{{d.emoji }}</span> {{ d.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="d.bestScore" :style="getBestScoreStyle(d.bestScore)">{{d.bestScore}}%</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon v-if="!d.downloaded">mdi-cloud-download</v-icon>
                <v-icon v-if="d.downloaded">mdi-check</v-icon>
              </v-list-item-icon>
            </v-list-item>

          </v-list>
        </v-menu>
      </v-col>

      <v-col cols="2" class="d-flex justify-end">
        <v-menu :offset-y="true" :nudge-top="35" top :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" @click="closeMenus">
              <v-icon>mdi-menu</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-subheader style="color: #2995fe"><strong>{{langs.aps[referenceLanguage]}}</strong></v-subheader>
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
                  <v-icon v-if="option.icon">{{option.icon}}</v-icon>
                  <img v-if="option.img" :src="option.img" style="max-height: 32px">
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="option.title"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <v-subheader style="color: #2995fe"><strong>{{langs.att[referenceLanguage]}}</strong></v-subheader>
            <v-list-item @click="toggleAudioEnabled">
              <v-list-item-icon v-if="audioEnabled">
                <v-icon>mdi-volume-off</v-icon>
              </v-list-item-icon>
              <v-list-item-title v-if="audioEnabled">{{langs.taoff[referenceLanguage]}}</v-list-item-title>
              <v-list-item-icon v-if="!audioEnabled">
                <v-icon>mdi-volume-high</v-icon>
              </v-list-item-icon>
              <v-list-item-title v-if="!audioEnabled">{{langs.taon[referenceLanguage]}}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleDarkTheme">
              <v-list-item-icon>
                <v-icon>mdi-theme-light-dark</v-icon>
              </v-list-item-icon>
              <v-list-item-title v-show="darkTheme">{{langs.stlt[referenceLanguage]}}</v-list-item-title>
              <v-list-item-title v-show="!darkTheme">{{langs.stdt[referenceLanguage]}}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleTestModeEnabled">
              <v-list-item-icon>
                <v-icon>mdi-ab-testing</v-icon>
              </v-list-item-icon>
              <v-list-item-title v-show="testModeEnabled">{{langs.ttoff[referenceLanguage]}}</v-list-item-title>
              <v-list-item-title v-show="!testModeEnabled">{{langs.tton[referenceLanguage]}}</v-list-item-title>
            </v-list-item>
            <v-list-item v-show="!testCompleteDialogEnabled" @click="enableTestDialog">
              <v-list-item-title>Reenable Test Complete Dialog</v-list-item-title>
            </v-list-item>
            <!-- <v-list-item @click="showDebug">
              <v-list-item-title>Expand View</v-list-item-title>
            </v-list-item> -->
            <v-divider></v-divider>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-title>
                <v-row>
                  <v-col>
                    <v-btn text @click="showLicenses">Licenses</v-btn>
                  </v-col>
                  <v-col v-show="isApp">
                    <v-btn text @click="rateUs">Rate Us</v-btn>
                  </v-col>
                </v-row>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.deck-selected {
  background: rgb(0,0,0,.2)
}
.action-bar {
  padding-bottom: env(safe-area-inset-bottom) !important;
  /* padding-bottom: 25px !important; */
}
</style>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import FireStreak from './FireStreak'

export default {
  name: 'ActionBar',
  computed: {
    ...mapState([
      'audioEnabled', 'darkTheme', 'referenceLanguage',
      'testModeEnabled', 'testCompleteDialogEnabled',
      'showAnswers', 'showHints', 'sortMethod',
      'isApp', 'androidApp', 'iOSApp', 'streak'
    ]),
    ...mapGetters(['deckList', 'learningLanguages', 'learningLanguage', 'deck']),
    menu () {
      const menu = {...this.menuData}
      for (let midx in menu) {
        menu[midx].title = menu[midx].titles[this.referenceLanguage]
        for (let oidx in menu[midx].options) {
          menu[midx].options[oidx].title = menu[midx].options[oidx].titles[this.referenceLanguage]
        }
      }
      return menu
    }
  },
  components: {
    FireStreak
  },
  methods: {
    ...mapActions(['deckChange', 'sortCards', 'setLanguage']),
    ...mapMutations([
      'setShowAnswers', 'setShowHints',
      'toggleAudioEnabled', 'toggleDarkTheme',
      'toggleTestModeEnabled',
      'setGeneric'
    ]),
    closeMenus () {
      this.menuData.forEach(item => item.active = false)
    },
    showDebug () {
      this.$emit('showDebug')
    },
    showLicenses () {
      this.setGeneric({prop: 'dialog', value: 'licenses'})
    },
    rateUs () {
      this.setGeneric({prop: 'dialog', value: 'rateUs'})
    },
    optionAction (item, option) {
      if (item === 'sort') {
        this.sortCards(option)
      } else if (item === 'images') {
        this.setShowHints(option)
      } else if (item === 'answers') {
        this.setShowAnswers(option)
      } else if (item === 'reference') {
        this.setGeneric({prop: 'cardIdx', value: -1})
        this.setGeneric({prop: 'referenceLanguage', value: option})
        this.setGeneric({prop: 'cardIdx', value: 0})
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
      } else if (item === 'reference') {
        return {
          'deck-selected': this.referenceLanguage === option
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
    deckMenuOpened: false,
    langs: {
      'learning': {
        en: 'Learning',
        es: 'Aprendizaje',
        ko: '배우기'
      },
      'avc': {
        en: 'Available Cards',
        es: 'Tarjetas Disponibles',
        ko: '사용 가능한 카드'
      },
      'aps': {
        en: 'App Settings',
        es: 'Ajustes de Aplicacion',
        ko: '앱 설정'
      },
      'att': {
        en: 'Audio / Theme / Tests',
        es: 'Audio / Tema / Pruebas',
        ko: '오디오 / 테마 / 테스트'
      },
      'taoff': {
        en: 'Turn Audio Off',
        es: 'Apague el Audio',
        ko: '오디오 끄기'
      },
      'taon': {
        en: 'Turn Audio On',
        es: 'Activar Audio',
        ko: '오디오 켜기'
      },
      'stlt': {
        en: 'Switch to Light Theme',
        es: 'Cambiar a Tema de Luz',
        ko: '밝은 테마로 전환'
      },
      'stdt': {
        en: 'Switch to Dark Theme',
        es: 'Cambiar a Tema Oscuro',
        ko: '어두운 테마로 전환'
      },
      'ttoff': {
        en: 'Turn Tests Off',
        es: 'Desactivar Pruebas',
        ko: '테스트 끄기'
      },
      'tton': {
        en: 'Turn Tests On',
        es: 'Activar las Pruebas',
        ko: '테스트 켜기'
      }
    },
    menuData: [
      {
        titles: {
          en: 'Reference Language',
          es: 'Lenguaje de Referencia',
          ko: '참조 언어',
        },
        slug: 'reference',
        icon: 'mdi-web',
        active: false,
        options: [
          {
            titles: {
              en: 'English',
              es: 'Inglés',
              ko: '영어'
            },
            slug: 'en',
            img: require('@/assets/lang-icons/en.png')
          }, {
            titles: {
              en: 'Spanish',
              es: 'Español',
              ko: '스페인의'
            },
            slug: 'es',
            img: require('@/assets/lang-icons/es.png')
          }, {
            titles: {
              en: 'Korean',
              es: 'Coreano',
              ko: '한국어'
            },
            slug: 'ko',
            img: require('@/assets/lang-icons/ko.png')
          }
        ]
      }, {
        titles: {
          en: 'Sort Cards',
          es: 'Ordenar Tarjetas',
          ko: '카드 정렬',
        },
        slug: 'sort',
        icon: 'mdi-sort-reverse-variant',
        active: false,
        options: [
          {
            titles: {
              en: 'Alphabetical',
              es: 'Alfabética',
              ko: '알파벳순'
            },
            slug: 'alpha',
            icon: 'mdi-sort-alphabetical-ascending-variant'
          }, {
            titles: {
              en: 'Initial',
              es: 'Inicial',
              ko: '머리 글자'
            },
            slug: 'sheet',
            icon: 'mdi-sort-numeric-ascending'
          }, {
            titles: {
              en: 'Least Viewed',
              es: 'Menos Vista',
              ko: '가장 적게 본'
            },
            slug: 'leastViewed',
            icon: 'mdi-sort-ascending'
          }, {
            titles: {
              en: 'Shuffle',
              es: 'Barajar',
              ko: '혼합'
            },
            slug: 'shuffle',
            icon: 'mdi-shuffle-variant'
          }
        ]
      }, {
        titles: {
          en: 'Show Images',
          es: 'Mostrar Imagenes',
          ko: '이미지 표시'
        },
        slug: 'images',
        icon: 'mdi-tooltip-image',
        active: false,
        options: [
          {
            titles: {
              en: 'Always Show',
              es: 'Siempre Muestra',
              ko: '항상 표시'
            },
            slug: 'always',
            icon: 'mdi-pin-outline'
          }, {
            titles: {
              en: 'Show on Tap',
              es: 'Mostrar al Tocar',
              ko: '탭에 표시'
            }, 
            slug: 'onTap',
            icon: 'mdi-gesture-tap'
          }, {
            titles: {
              en: 'Never Show',
              es: 'Nunca Mostrar',
              ko: '표시 안함'
            },
            slug: 'never',
            icon: 'mdi-eye-off-outline'
          }
        ]
      }, {
        titles: {
          en: 'Show Answers',
          es: 'Mostrar Respuestas',
          ko: '답을 알려줘'
        },
        slug: 'answers',
        icon: 'mdi-forum',
        active: false,
        options: [
          {
            titles: {
              en: 'Always Show',
              es: 'Siempre Muestra',
              ko: '항상 표시'
            },
            slug: 'always',
            icon: 'mdi-pin-outline'
          }, {
            titles: {
              en: 'Show on Tap',
              es: 'Mostrar al Tocar',
              ko: '탭에 표시'
            }, 
            slug: 'onTap',
            icon: 'mdi-gesture-tap'
          }, {
            titles: {
              en: 'Never Show',
              es: 'Nunca Mostrar',
              ko: '표시 안함'
            },
            slug: 'never',
            icon: 'mdi-eye-off-outline'
          }
        ]
      }
    ]
    
  }),
}
</script>
