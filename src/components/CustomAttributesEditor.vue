<script>
import { sortBy, upperFirst, isEqual } from 'lodash'

export default {
  props: {
    values: {
      type: Object,
      default: () => ({})
    },
    definitions: {
      type: Array,
      default: () => []
    },
    maxNbTags: {
      type: Number,
      default: 10
    },
    sync: {
      type: Boolean,
      default: true
    }
  },
  data () {
    const tagOptions = {}
    this.definitions
      .filter(ca => ca.type === 'tags')
      .forEach(ca => { tagOptions[ca.name] = ca.suggestedValues || [] })

    return {
      customAttributes: this.values,
      tagOptions,
      filteredTagOptions: Object.assign({}, tagOptions)
    }
  },
  computed: {
    sortedDefinitions () {
      return sortBy(this.definitions, ca => -ca.priority)
    },
    booleanCustomAttributes () {
      return this.sortedDefinitions.filter(ca => ca.type === 'boolean')
    },
    notBooleanCustomAttributes () {
      return this.sortedDefinitions.filter(ca => ca.type !== 'boolean')
    }
  },
  watch: {
    values (v) { // Sync changes of values in parent
      if (this.sync && !isEqual(this.customAttributes, v)) {
        this.customAttributes = v
      }
    }
  },
  methods: {
    onCustomAttributeChange (name, value) {
      this.$set(this.customAttributes, name, value)
      this.$emit('change', this.customAttributes)
    },
    contentKey (customAttribute) {
      return `${customAttribute.label.entry}.${customAttribute.label.field}`
    },
    createTagValue (val, done, caName) {
      // https://quasar.dev/vue-components/select#Example--Filtering-and-adding-to-menu
      if (val.length > 1) {
        const v = upperFirst(val)
        if (!this.tagOptions[caName].includes(v)) this.tagOptions[caName].push(v)
        done(val, 'add-unique')
      }
    },
    filterTagsFn (val, updated, caName) {
      updated(() => {
        if (val === '') {
          this.filteredTagOptions[caName] = this.tagOptions[caName]
        } else {
          const needle = val.toLowerCase()
          this.filteredTagOptions[caName] = this.tagOptions[caName]
            .filter(v => v.toLowerCase().indexOf(needle) > -1)
        }
      })
    }
  },
}
</script>

<template>
  <div>
    <QList
      v-if="booleanCustomAttributes.length"
      class="text-left"
      link
    >
      <QItem
        v-for="customAttribute in booleanCustomAttributes"
        :key="customAttribute.id"
        v-ripple
        tag="label"
      >
        <template>
          <QItemSection avatar>
            <!-- Assuming than unchecking means indifferent (true, false or undefined), not false only -->
            <!-- Quasar uses null as default indeterminate-value, but we need null to unset custom attributes -->
            <QCheckbox
              :value="customAttributes[customAttribute.name] || null"
              :indeterminate-value="0"
              :false-value="null"
              color="secondary"
              @input="(value) => onCustomAttributeChange(customAttribute.name, value)"
            />
          </QItemSection>

          <QItemSection>
            <AppContent
              tag="QItemLabel"
              :entry="customAttribute.label.entry"
              :field="customAttribute.label.field"
              :default-message="customAttribute.label.default"
            />
            <AppContent
              v-if="customAttribute.description && customAttribute.description.entry"
              tag="QItemLabel"
              caption
              :entry="customAttribute.description.entry"
              :field="customAttribute.description.field"
              :default-message="customAttribute.description.default"
            />
          </QItemSection>
        </template>
      </QItem>
    </QList>

    <div v-if="notBooleanCustomAttributes.length">
      <div
        v-for="customAttribute in notBooleanCustomAttributes"
        :key="customAttribute.id"
        class="q-mt-md"
      >
        <template v-if="customAttribute.type === 'select'">
          <QSelect
            v-model="customAttributes[customAttribute.name]"
            :options="customAttribute.listValues"
            :label="$t({ id: contentKey(customAttribute) })"
            @input="(value) => onCustomAttributeChange(customAttribute.name, value)"
          >
            <template v-slot:append>
              <QBtn
                v-show="customAttributes[customAttribute.name]"
                icon="close"
                flat
                dense
                rounded
                @click.stop="customAttributes[customAttribute.name] = null"
              />
            </template>
          </QSelect>
        </template>
        <template v-else-if="customAttribute.type === 'number'">
          <QInput
            v-model="customAttributes[customAttribute.name]"
            type="number"
            :label="$t({ id: contentKey(customAttribute) })"
            @input="(value) => onCustomAttributeChange(customAttribute.name, parseFloat(value))"
          />
        </template>
        <template v-else-if="customAttribute.type === 'tags'">
          <QSelect
            v-model="customAttributes[customAttribute.name]"
            :options="tagOptions[customAttribute.name]"
            :label="$t({ id: contentKey(customAttribute) })"
            :max-values="maxNbTags"
            use-input
            use-chips
            multiple
            input-debounce="0"
            @new-value="(val, done) => createTagValue(val, done, customAttribute.name)"
            @input="(value) => onCustomAttributeChange(customAttribute.name, value)"
            @filter="(val, updated) => filterTagsFn(val, updated, customAttribute.name)"
          >
            <template v-slot:selected-item="scope">
              <QChip
                v-if="customAttributes[customAttribute.name]"
                :tabindex="scope.tabindex"
                dense
                square
                removable
                color="accent"
                text-color="white"
                class="q-mt-sm q-ml-xs q-mr-none"
                @remove="scope.removeAtIndex(scope.index)"
              >
                <QAvatar
                  :icon="customAttribute.materialIcon || 'flash_on'"
                  color="primary"
                  text-color="white"
                />
                {{ scope.opt }}
              </QChip>
            </template>
          </QSelect>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
</style>
