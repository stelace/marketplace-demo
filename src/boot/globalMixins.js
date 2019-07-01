import History from 'src/mixins/history'
import Notify from 'src/mixins/notify'

export default async ({ Vue }) => {
  Vue.mixin(History)
  Vue.mixin(Notify)
}
