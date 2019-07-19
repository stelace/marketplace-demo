<template>
  <QSelect
    ref="select"
    :class="[
      'stl-select-asset-types',
      (textQueryLength < autocompleteMinChars) ||
        (autocompleteMinChars && !filteredAssetTypes.length) ||
        selectedAssetType ?
          'stl-select-asset-types--hide-autocomplete'
        : ''
    ]"
    v-bind="$attrs"
    :value="selectedAssetType"
    :options="filteredAssetTypes"
    :option-value="type => type && type.id"
    :option-label="type => type && type.name"
    :use-input="!(hideInputOnSelect && selectedAssetType)"
    :loading="!!(textQueryLength && common.fetchingAssetTypes)"
    @input="type => selectAssetType(type)"
    @filter="filterAssetTypes"
    @keyup.down.native="focusChanged"
    @keyup.up.native="focusChanged"
    @keyup.enter.native="onEnter"
    @blur.native.capture="filterAssetTypes(0)"
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
      <template v-if="showSearchIcon && searchIconPosition === 'right' && !selectedAssetType">
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
        v-show="selectedAssetType"
        icon="close"
        flat
        dense
        rounded
        @click.stop="selectAssetType(null)"
      />
    </template>
  </QSelect>
</template>

<script>
import { mapGetters } from 'vuex'

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
    initialAssetType: {
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
    },
    filteredIds: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      selectedAssetType: this.initialAssetType,
      filteredAssetTypes: [],
      optionFocused: -1,
      textQueryLength: 0
    }
  },
  computed: {
    optionIndex () {
      if (!this.$refs.select) return -1 // before rendering

      return this.$refs.select.optionIndex
    },
    assetTypes () {
      const assetTypes = this.activeAssetTypes

      if (this.filteredIds) {
        return assetTypes.filter(assetType => this.filteredIds.includes(assetType.id))
      } else {
        return assetTypes
      }
    },
    ...mapGetters([
      'activeAssetTypes'
    ])
  },
  mounted () {
    this.$store.dispatch('fetchAssetTypes')
  },
  methods: {
    filterAssetTypes (value, update, abort) {
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
        this.filteredAssetTypes = this.assetTypes.filter(type => {
          return type.name.toLowerCase().indexOf(needle) > -1
        })
      })
    },
    selectAssetType (assetType) {
      this.selectedAssetType = assetType
      this.$emit('change', assetType)
    },
    onEnter () {
      this.selectAssetType(this.optionFocused > 0 ? this.filteredAssetTypes[this.optionFocused] : this.filteredAssetTypes[0])
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
.stl-select-asset-types .q-local-menu
  top: 100%

.stl-select-asset-types.stl-select-asset-types--hide-autocomplete .q-select__dropdown-icon
  display: none
</style>
