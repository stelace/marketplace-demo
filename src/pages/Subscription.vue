<template>
  <q-page>
    <section class="q-pa-lg relative-position text-center">
      <Plans
        :current-plan-id="currentPlanId"
        :show-cta-buttons="false"
        :selectable="!isSubscriptionActive"
        :selected-plan-id="selectedPlanId"
        @selectPlan="selectPlan"
      />
    </section>

    <section class="q-pa-lg relative-position text-center">
      <div v-if="isSubscriptionActive">
        <div>
          <span>
            <span v-if="isSubscriptionCancelled">
              {{ $t({ id: 'payment.subscription.expiry_label' }) }}
            </span>
            <span v-else>
              {{ $t({ id: 'payment.subscription.upcoming_deadline_label' }) }}
            </span>
          </span>
          &nbsp;:&nbsp;
          <strong>
            {{ $t({ id: 'time.date_long' }, { date: currentPeriodEndDate }) }}
          </strong>
        </div>

        <div>
          <q-btn
            v-show="!isSubscriptionCancelled"
            :rounded="style.roundedTheme"
            color="accent"
            class="q-mt-md q-mb-none"
            :label="$t({ id: 'payment.subscription.unsubscribe_label' })"
            @click="unsubscribe"
          />
        </div>
      </div>
      <div v-else>
        <q-btn
          :rounded="style.roundedTheme"
          color="accent"
          class="q-mt-md q-mb-none"
          :disabled="!selectedPlanId"
          :label="$t({ id: 'payment.subscription.subscribe_label' })"
          @click="subscribe(selectedPlan)"
        />
      </div>
    </section>
  </q-page>
</template>

<script>
import { get } from 'lodash'
import { mapState, mapGetters } from 'vuex'

import Plans from 'src/components/Plans'

import PageComponentMixin from 'src/mixins/pageComponent'
import PaymentMixin from 'src/mixins/payment'

export default {
  components: {
    Plans,
  },
  mixins: [
    PageComponentMixin,
    PaymentMixin,
  ],
  data () {
    return {
      selectedPlanId: null,
    }
  },
  computed: {
    locale () {
      return this.content.locale || 'en'
    },
    currentPeriodEndDate () {
      if (!this.isSubscriptionActive) return

      return new Date(this.currentUserSubscription.currentPeriodEndDate)
    },
    isSubscriptionCancelled () {
      return !!(this.currentUserSubscription && this.currentUserSubscription.cancelAtPeriodEnd)
    },
    currentPlanId () {
      if (!this.isSubscriptionActive) return ''

      const plan = get(this.currentUserSubscription, 'plan')
      if (!plan) return ''

      return plan.id
    },
    ...mapState([
      'common',
      'content',
      'style',
    ]),
    ...mapGetters([
      'plans',
      'selectedUser',
      'currentUser',
      'currentUserSubscription'
    ])
  },
  methods: {
    async afterAuth () {
      const { planId } = this.$route.query

      if (!this.checkAccessOrRedirect('subscribeToPlan')) return

      if (!this.isSubscriptionActive) {
        this.selectedPlanId = planId
      }
    },
    selectPlan (plan) {
      this.subscribe(plan)
    },
    async unsubscribe () {
      const subscription = this.currentUserSubscription

      await this.$store.dispatch('cancelSubscription', { subscription })
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
