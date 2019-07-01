import AuthDialogMixin from './authDialog'
import AuthenticatedRouteMixin from './authenticatedRoute'
import AuthorizedRouteMixin from './authorizedRoute'
import HashScrollMixin from './hashScroll'
import ValidationDialogMixin from './validationDialog'
import SeoMixin from './seo'

export default {
  mixins: [
    AuthDialogMixin,
    AuthenticatedRouteMixin,
    AuthorizedRouteMixin,
    HashScrollMixin,
    ValidationDialogMixin,
    SeoMixin,
  ]
}
