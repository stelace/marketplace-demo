// Ensure proper responsiveness with Quasar Screen plugin despite prerendering
// https://github.com/quasarframework/quasar/issues/2299#issuecomment-564301345

import { Quasar } from 'quasar'

const { ssrUpdate } = Quasar

export default ({ app }) => {
  ssrUpdate({ app })
}
