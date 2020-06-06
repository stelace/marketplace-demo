import { config } from 'dotenv'
import { join } from 'path'
import VueSelector from 'testcafe-vue-selectors'

const dotEnvFilePath = join(__dirname, '../../', '.env.development')
config({ path: dotEnvFilePath })

export default class HomeModel {
  // VueSelector has no type
  searchInput: any
  searchButton: any

  constructor() {
    if (process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true') {
      this.searchInput = VueSelector('ref:heroSearchCategoryAutocomplete')
    } else {
      this.searchInput = VueSelector('ref:heroSearchInput')
    }
    this.searchButton = VueSelector('ref:heroSearchButton')
  }
}
