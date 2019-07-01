<template>
  <transition-group
    appear
    enter-active-class="animated fadeInLeft"
    class="row q-col-gutter-xl justify-center q-pb-xl items-stretch"
    tag="div"
  >
    <div
      v-for="plan in displayedPlans"
      :key="plan.id"
      :class="['plan-card-container col-12', showFreePlan ? 'col-md-3' : 'col-md-4']"
    >
      <q-card
        class="plan-card column justify-between q-pa-md"
        :class="[
          selectable ? 'cursor-pointer' : 'inactive',
          selectedPlanId === plan.id ? 'plan-card--selected' : '',
          plan.highlight ? 'plan-card--highlight' : ''
        ]"
        @click="selectPlan(plan)"
      >
        <div
          v-if="plan.isCurrent"
          class="plan-tag"
        >
          <AppContent
            entry="payment"
            field="subscription.selected_plan_label"
          />
        </div>
        <q-card-section class="q-py-xs q-px-sm text-center">
          <h3 class="text-uppercase text-h6 q-my-none text-weight-bold ellipsis">
            <span v-if="plan.title">{{ plan.title }}</span>
            <span v-else-if="!plan.isFree">
              <AppContent
                entry="time"
                field="unit_label"
                :options="{ timeUnit: plan.timeUnit, nbTimeUnits: plan.nbTimeUnits }"
              />
            </span>
            <span
              v-else
              class="invisible"
            >-</span>
          </h3>
          <div class="text-h5 q-my-md text-weight-medium text-primary">
            <div v-if="plan.isFree">
              <AppContent
                entry="pricing"
                field="free"
              />
            </div>
            <div v-else>
              <AppContent
                tag="span"
                entry="pricing"
                field="price_with_currency"
                :options="{ price: plan.priceTaxExcluded }"
              />
              <AppContent
                tag="span"
                entry="pricing"
                field="tax_excluded"
              />
            </div>
          </div>
          <div
            :class="[
              'text-weight-medium text-primary',
              plan.timeUnitPrice || plan.timeUnitPriceText ? '' : 'invisible'
            ]"
          >
            <div v-if="plan.timeUnitPrice">
              <AppContent
                tag="span"
                entry="pricing"
                field="price_per_time_unit_label_tax_excluded"
                :options="{ timeUnit: plan.timeUnit, nbUnits: plan.nbTimeUnits, price: plan.timeUnitPrice }"
              />
              <span v-if="plan.discountValue">
                {{ '(' + $t({ id: 'number.fraction.percent' }, { hundredth: plan.discountValue }) + ')' }}
              </span>
            </div>
            <div v-else-if="plan.timeUnitPriceText">
              {{ plan.timeUnitPriceText }}
            </div>
            <div v-else>
              -
            </div>
          </div>
          <div
            v-if="plan.features && plan.features.length"
            class="text-subtitle1 text-weight-medium ellipsis q-mt-md"
          >
            <div
              v-for="(feature, index) in plan.features"
              :key="feature"
            >
              <div
                v-if="index"
                class="text-center"
              >
                <q-icon
                  name="add_circle"
                  :color="plan.isFree ? 'gray' : 'secondary'"
                />
              </div>
              <span class="preserve-lines">{{ feature }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-if="showCtaButtons">
          <q-btn
            :rounded="style.roundedTheme"
            :color="plan.highlight ? 'secondary' : 'primary'"
            class="q-mt-md q-mb-none"
            :label="$t({ id: plan.isFree ? 'authentication.sign_up_action' : 'payment.subscription.subscribe_label' })"
          />
        </q-card-section>
      </q-card>
    </div>
  </transition-group>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import PaymentMixin from 'src/mixins/payment'

export default {
  mixins: [
    PaymentMixin,
  ],
  props: {
    showPlans: {
      type: Boolean,
      default: true
    },
    showFreePlan: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: true
    },
    currentPlanId: {
      type: String,
      default: ''
    },
    selectedPlanId: {
      type: String,
      default: ''
    },
    showCtaButtons: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState({
      style: state => state.style,
    }),
    ...mapGetters([
      'plans',
    ]),
    transformedPlans () {
      const plans = this.showFreePlan
        ? this.plans
        : this.plans.filter(plan => !plan.isFree)

      return plans.map(plan => {
        const planWithContent = this.getPlanWithContent(plan)
        return Object.assign({}, planWithContent, {
          isCurrent: plan.id === this.currentPlanId,
        })
      })
    },
    displayedPlans () {
      return this.showPlans ? this.transformedPlans : []
    }
  },
  methods: {
    selectPlan (plan) {
      if (!this.selectable) return

      this.$emit('selectPlan', plan)
    }
  }
}

</script>

<style lang="stylus" scoped>
.plan-card-container
  max-width 20rem
  // for transition group animation
  &:nth-child(1)
    animation-delay 900ms
  &:nth-child(2)
    animation-delay 600ms
  &:nth-child(3)
    animation-delay 300ms
  &:nth-child(n + 4)
    animation-delay 100ms

.plan-card
  height: 100%
  transition $transition-duration
  border-top 8px solid transparent
  &:hover:not(.inactive)
    transform translateY(-4px)
    box-shadow 2px 3px 15px 5px rgba(0,0,0,0.3)
  &.plan-card--highlight
    border-top-color $secondary
  &.plan-card--selected
    box-shadow 2px 3px 15px 5px rgba(0,0,0,0.3)

.plan-tag
  position absolute
  top -8px
  left 0
  width 100%
  line-height 16px
  font-size 12px
  height 18px
  text-transform uppercase
  font-weight bold
  color white
  padding 2px
  background-color $primary
  text-align center
</style>
