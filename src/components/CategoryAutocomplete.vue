// Unlike SelectCategories, this component allows free text as well

<template>
  <QSelect
    ref="select"
    v-model="textQuery"
    class="stl-select-categories"
    v-bind="$attrs"
    :options="filteredCategoriesNames"
    :loading="!!(textQueryLength && common.fetchingCategories)"
    :hide-dropdown-icon="isDropdownIconHidden"
    use-input
    fill-input
    hide-selected
    @input="cat => selectCategory(cat)"
    @input-value="textChanged"
    @filter="filterCategories"
  >
    <template
      v-if="showSearchIcon && searchIconPosition === 'left'"
      v-slot:prepend
    >
      <QBtn
        v-if="iconButtonAction"
        :color="iconColor"
        :icon="icons.matSearch"
        flat
        dense
        rounded
        @click="iconButtonAction"
      />
      <QIcon
        v-else
        :color="iconColor"
        :name="icons.matSearch"
      />
    </template>

    <template v-slot:append>
      <template v-if="showSearchIcon && searchIconPosition === 'right' && !selectedCategory">
        <QBtn
          v-if="iconButtonAction"
          :color="iconColor"
          :icon="icons.matSearch"
          flat
          dense
          rounded
          @click="iconButtonAction"
        />
        <QIcon
          v-else
          :color="iconColor"
          :name="icons.matSearch"
        />
      </template>
      <QBtn
        v-show="selectedCategory || textQuery"
        :icon="icons.matClose"
        flat
        dense
        rounded
        @click.stop="selectCategory(null)"
      />
    </template>
  </QSelect>
</template>

<script>
import { get, values, cloneDeep, sortBy, groupBy, times, constant } from 'lodash'
import { mapState } from 'vuex'
import { matClose, matSearch } from '@quasar/extras/material-icons'

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
    setCategory: {
      type: Object,
      default: null
    },
    setText: {
      type: String,
      default: ''
    },
    autocompleteMinChars: {
      type: Number,
      default: 0 // Set to 0 to always show autocomplete
    }
  },
  data () {
    return {
      selectedCategory: this.setCategory,
      filteredCategories: [],
      textQuery: get(this.setCategory, 'name', this.setText || '')
    }
  },
  computed: {
    optionIndex () {
      // TODO: submit a PR to quasar to expose focus or a method to get it
      // like setOptionIndex in current code
      // https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/QSelect.js#L297
      if (!this.$refs.select) return -1 // before rendering

      return this.$refs.select.optionIndex
    },
    categories () {
      const categoriesById = this.common.categoriesById

      return this.sortCategoriesByLvl(values(categoriesById))
    },
    filteredCategoriesNames () {
      return this.filteredCategories.map(c => c.nameWithLvlSpaces)
    },
    isDropdownIconHidden () {
      return (this.textQueryLength < this.autocompleteMinChars) ||
        (this.autocompleteMinChars && !this.filteredCategories.length) ||
        (this.textQuery && !this.filteredCategories.length)
    },
    textQueryLength () {
      return (this.textQuery || '').length
    },
    ...mapState([
      'common'
    ])
  },
  watch: {
    // component is not expected to emit events for edits coming from the outside,
    // so we only update internal values without emitting
    setCategory (cat) {
      const isSame = cat && this.selectedCategory && cat.id === this.selectedCategory.id
      const isNullOrHasAName = cat === null || (cat && cat.name)
      if (!isNullOrHasAName || isSame) return

      this.selectedCategory = cat
      this.textQuery = get(this.selectedCategory, 'name', '')
    },
    setText (t) {
      if (this.selectedCategory) return
      this.textQuery = t || ''
    }
  },
  mounted () {
    this.$store.dispatch('fetchCategories')
  },
  created () {
    this.icons = {
      matSearch,
      matClose
    }
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
      if (this.textQueryLength < this.autocompleteMinChars) {
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
    selectCategory (name) {
      const hadACategory = !!this.selectedCategory
      if (!name) this.reset()
      else {
        // We’re using a string model in QSelect to handle free text value as well,
        // but for category objects we’d like to keep track of the precise object selected,
        // but it seems very trick to use object options with text model. text model example:
        // https://quasar.dev/vue-components/select#Example--Text-autocomplete
        this.selectedCategory = this.filteredCategories.find(c => c.nameWithLvlSpaces === name)
        // It would be safer to store selected option index since 2 (sub)categories
        // can have the same name but Quasar does not expose this currently,
        // and we would have to hack with optionIndex (updated before input event is emitted).
        // -> Quasar PR needed
      }
      const hasACategory = !!this.selectedCategory
      if (hadACategory || hasACategory) {
        this.$emit('category-changed', this.selectedCategory)
        // full-text search is expected to be reset by consumer
        // when there is a match on category, for instance to avoid
        // searching assets having "Hardware items" category _and_ Hardwa text…
        this.$emit('text-changed', '')
      }
    },
    async textChanged (t) {
      this.textQuery = t
      await this.$nextTick() // let category be updated to test the following condition
      // we don’t want to let the consumer think that text has changed if it’s just
      // because of category change
      if (!this.selectedCategory) this.emitQuery()
    },
    emitQuery () {
      this.$emit('text-changed', this.textQuery)
    },
    reset () {
      this.selectedCategory = null
      this.textQuery = ''
      this.$refs.select.updateInputValue('')
      this.$refs.select.focus()
    }
  }
}

</script>

<style lang="stylus">
</style>
