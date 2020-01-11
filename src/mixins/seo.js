import { get, snakeCase } from 'lodash'

export default {
  metaInfo () {
    const route = this.$route
    const routeTranslationField = snakeCase(route.name || 'home')

    let metaTitle = get(route, 'meta.title')
    if (metaTitle && metaTitle.entry && metaTitle.field) {
      metaTitle = this.$t({ id: `${metaTitle.entry}.${metaTitle.field}` })
    }

    let metaDescription = get(route, 'meta.description')
    if (metaDescription && metaDescription.entry && metaDescription.field) {
      metaDescription = this.$t({ id: `${metaDescription.entry}.${metaDescription.field}` })
    }

    return {
      title: metaTitle ||
        this.$t({ id: `pages.${routeTranslationField}.page_title` }) ||
        this.$t({ id: `pages.${routeTranslationField}.header` }),
      meta: [{
        name: 'description',
        vmid: 'description',
        content: metaDescription ||
          this.$t({ id: `pages.${routeTranslationField}.meta_description` })
      }],
    }
  }
}
