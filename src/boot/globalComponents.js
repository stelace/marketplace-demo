import AssetCard from 'src/components/AssetCard'
import AppAvatar from 'src/components/AppAvatar'
import AppCheckoutButton from 'src/components/AppCheckoutButton'
import AppContent from 'src/components/AppContent'
import AppDateRangePicker from 'src/components/AppDateRangePicker'
import AppFooter from 'src/components/AppFooter'
import AppGalleryUploader from 'src/components/AppGalleryUploader'
import AppInputNumber from 'src/components/AppInputNumber'
import AppLink from 'src/components/AppLink'
import AppRating from 'src/components/AppRating'
import AppRatingStars from 'src/components/AppRatingStars'
import AppRatingSlider from 'src/components/AppRatingSlider'
import AppSwitchableEditor from 'src/components/AppSwitchableEditor'

export default async ({ Vue }) => {
  Vue.component('AssetCard', AssetCard)
  Vue.component('AppAvatar', AppAvatar)
  Vue.component('AppCheckoutButton', AppCheckoutButton)
  Vue.component('AppContent', AppContent)
  Vue.component('AppDateRangePicker', AppDateRangePicker)
  Vue.component('AppFooter', AppFooter)
  Vue.component('AppGalleryUploader', AppGalleryUploader)
  Vue.component('AppInputNumber', AppInputNumber)
  Vue.component('AppLink', AppLink)
  Vue.component('AppRating', AppRating)
  Vue.component('AppRatingStars', AppRatingStars)
  Vue.component('AppRatingSlider', AppRatingSlider)
  Vue.component('AppSwitchableEditor', AppSwitchableEditor)
}
