import AssetCard from 'src/components/AssetCard'
import AppAvatar from 'src/components/AppAvatar'
import AppContent from 'src/components/AppContent'
import AppFooter from 'src/components/AppFooter'
import AppLink from 'src/components/AppLink'
import AppRating from 'src/components/AppRating'
import AppRatingStars from 'src/components/AppRatingStars'
import AppRatingSlider from 'src/components/AppRatingSlider'
import AppSwitchableEditor from 'src/components/AppSwitchableEditor'

export default async ({ Vue }) => {
  Vue.component('AssetCard', AssetCard)
  Vue.component('AppAvatar', AppAvatar)
  Vue.component('AppContent', AppContent)
  Vue.component('AppFooter', AppFooter)
  Vue.component('AppLink', AppLink)
  Vue.component('AppRating', AppRating)
  Vue.component('AppRatingStars', AppRatingStars)
  Vue.component('AppRatingSlider', AppRatingSlider)
  Vue.component('AppSwitchableEditor', AppSwitchableEditor)
}
