<template>
  <QSelect
    ref="select"
    :class="[
      'stl-select-categories',
      (textQueryLength < autocompleteMinChars) ||
        (autocompleteMinChars && !filteredCategories.length) ||
        selectedCategory ?
          'stl-select-categories--hide-autocomplete'
        : ''
    ]"
    v-bind="$attrs"
    :value="selectedCategory"
    :options="filteredCategories"
    :option-value="cat => cat && cat.id"
    :option-label="cat => cat && cat.nameWithLvlSpaces"
    :use-input="!(hideInputOnSelect && selectedCategory)"
    :loading="!!(textQueryLength && common.fetchingCategories)"
    :display-value="(selectedCategory && selectedCategory.name) || ''"
    @input="cat => selectCategory(cat)"
    @filter="filterCategories"
    @keyup.down.native="focusChanged"
    @keyup.up.native="focusChanged"
    @keyup.enter.native="onEnter"
    @blur.native.capture="filterCategories(0)"
  >
    <template
      v-if="showSearchIcon && searchIconPosition === 'left'"
      v-slot:prepend
    >
      <QBtn
        v-if="iconButtonAction"
        :color="iconColor"
        icon="search"
        flat
        dense
        rounded
        @click="iconButtonAction"
      />
      <QIcon
        v-else
        :color="iconColor"
        name="search"
      />
    </template>

    <template v-slot:append>
      <template v-if="showSearchIcon && searchIconPosition === 'right' && !selectedCategory">
        <QBtn
          v-if="iconButtonAction"
          :color="iconColor"
          icon="search"
          flat
          dense
          rounded
          @click="iconButtonAction"
        />
        <QIcon
          v-else
          :color="iconColor"
          name="search"
        />
      </template>
      <QBtn
        v-show="selectedCategory"
        icon="close"
        flat
        dense
        rounded
        @click.stop="selectCategory(null)"
      />
    </template>
  </QSelect>
</template>

<script>
import { values, cloneDeep, sortBy, groupBy, times, constant } from 'lodash'
import { mapState } from 'vuex'

export default {
  props: {
    showSearchIcon: {
      type: Boolean,
      default: true
    },
    iconButtonAction: {
      type: Function,
      default: undefined
    },
    searchIconPosition: {
      type: String,
      validator: value => ['left', 'right'].includes(value),
      default: 'right'
    },
    iconColor: {
      type: String,
      default: undefined
    },
    initialCategory: {
      type: Object,
      default: null
    },
    autocompleteMinChars: {
      type: Number,
      default: 0 // Set to 0 to always show autocomplete
    },
    hideInputOnSelect: { // useful when line wrap should not happen
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectedCategory: this.initialCategory,
      filteredCategories: [],
      optionFocused: -1,
      textQueryLength: 0
    }
  },
  computed: {
    optionIndex () {
      if (!this.$refs.select) return -1 // before rendering

      return this.$refs.select.optionIndex
    },
    categories () {
      let categoriesById = this.common.categoriesById

      return this.sortCategoriesByLvl(values(categoriesById))
    },
    ...mapState([
      'common'
    ])
  },
  mounted () {
    this.$store.dispatch('fetchCategories')
  },
  methods: {
    sortCategoriesByLvl (categories) {
      const initialCategories = cloneDeep(categories)
      const categoriesByParentId = groupBy(initialCategories, 'parentId')

      const categoriesSortedByLvl = []

      const sortCategoriesByName = (categories) => sortBy(categories, 'name')

      const lvlSpace = '    '
      const addLvlSpaces = (number) => times(number, constant(lvlSpace)).join('')

      const addChildrenCategories = (cat, lvl) => {
        cat.nameWithLvlSpaces = addLvlSpaces(lvl - 1) + cat.name
        cat.lvl = lvl

        const children = categoriesByParentId[cat.id]
        if (children && children.length) {
          cat.children = sortCategoriesByName(children)
          cat.children.forEach(c => addChildrenCategories(c, lvl + 1))
        }

        cat.disable = !!cat.children
      }

      const addToFinalSort = (cat) => {
        categoriesSortedByLvl.push(cat)
        if (cat.children) {
          cat.children.forEach(addToFinalSort)
        }
      }

      const rootCategories = sortCategoriesByName(categoriesByParentId.null)
      rootCategories.forEach(cat => addChildrenCategories(cat, 1))
      rootCategories.forEach(addToFinalSort)

      return categoriesSortedByLvl
    },
    filterCategories (value, update, abort) {
      if (typeof update !== 'function') {
        this.textQueryLength = value // @blur event
        return
      }

      this.textQueryLength = value.length

      if (value.length < this.autocompleteMinChars) {
        abort()
        return
      }

      update(async () => {
        const needle = value.toLowerCase()
        this.filteredCategories = this.categories.filter(cat => {
          return cat.name.toLowerCase().indexOf(needle) > -1
        })
      })
    },
    selectCategory (category) {
      this.selectedCategory = category
      this.$emit('change', category)
    },
    onEnter () {
      this.selectCategory(this.optionFocused > 0 ? this.filteredCategories[this.optionFocused] : this.filteredCategories[0])
      // Keep optionFocused value in case Enter key is pressed again
    },
    focusChanged () { // TODO: submit a PR to quasar to expose focus or a method to get it
      // like setOptionIndex in current code
      // https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/QSelect.js#L297
      this.optionFocused = this.optionIndex
    },
  }
}

</script>

<style lang="stylus">
// Fix quasar initial positionning probably due to this wrapper
// https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/select-menu-position.js#L51
.stl-select-categories .q-local-menu
  top: 100%

.stl-select-categories.stl-select-categories--hide-autocomplete .q-select__dropdown-icon
  display: none
</style>
