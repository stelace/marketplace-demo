import { sync } from 'vuex-router-sync'

export default ({ router, store }) => {
  sync(store, router)
}
