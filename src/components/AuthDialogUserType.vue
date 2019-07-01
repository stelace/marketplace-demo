<script>
import { isNil, keyBy } from 'lodash'
import { required } from 'vuelidate/lib/validators'

import { getDisplayName } from 'src/utils/user'

export default {
  props: {
    visibleUserTypes: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      userType: null,
      firstname: null,
      lastname: null,
      displayName: null,
    }
  },
  validations: {
    userType: {
      required
    }
  },
  computed: {
    valid () {
      return !isNil(this.userType)
    },
    userDisplayName () {
      return getDisplayName(this.firstname, this.lastname)
    },
    visibleUserTypesByKey () {
      return keyBy(this.visibleUserTypes)
    }
  },
  mounted () {
    this.$emit('update:roles', this.roles)
    this.$emit('update:firstname', this.firstname)
    this.$emit('update:lastname', this.lastname)
    this.$emit('update:displayName', this.displayName)
    this.$emit('is-valid', this.valid)
  },
  methods: {
    changeUserType (userType) {
      this.userType = userType

      let roles
      if (userType === 'user') {
        roles = ['user']
        this.$emit('update:displayName', this.userDisplayName)
      } else {
        roles = ['provider']
        this.$emit('update:firstname', null)
        this.$emit('update:lastname', null)
      }

      this.$emit('update:roles', roles)
      this.$emit('is-valid', this.valid)
    },
    changeAttribute (attr, value) {
      this[attr] = value

      this.$emit(`update:${attr}`, value)
      this.$emit('is-valid', this.valid)

      if (this.userType === 'user') {
        this.$emit('update:displayName', this.userDisplayName)
      }
    }
  }
}
</script>

<template>
  <div>
    <h2 class="text-center text-h6 q-my-none">
      <AppContent
        entry="user"
        field="select_user_group_helper"
      />
    </h2>
    <div class="row justify-around">
      <QRadio
        v-if="visibleUserTypesByKey['user']"
        :value="userType"
        val="user"
        @input="changeUserType"
      >
        <AppContent
          entry="user"
          field="user_label"
        />
      </QRadio>
      <QRadio
        v-if="visibleUserTypesByKey['provider']"
        :value="userType"
        val="provider"
        @input="changeUserType"
      >
        <AppContent
          entry="user"
          field="provider_label"
        />
      </QRadio>
    </div>
    <div v-show="userType === 'user'">
      <q-input
        :value="firstname"
        type="text"
        :label="$t({ id: 'user.firstname_label' })"
        autocomplete="firstname"
        required
        @input="value => changeAttribute('firstname', value)"
      />
      <!-- <q-input
        :value="lastname"
        type="text"
        :label="$t({ id: 'user.lastname_label' })"
        autocomplete="lastname"
        required
        @input="value => changeAttribute('lastname', value)"
      /> -->
    </div>
    <div v-show="userType === 'provider'">
      <!-- <q-input
        :value="displayName"
        type="text"
        :label="$t({ id: 'user.organization_label' })"
        autocomplete="displayName"
        required
        @input="value => changeAttribute('displayName', value)"
      /> -->
    </div>
  </div>
</template>

<style lang="stylus" scoped>

</style>
