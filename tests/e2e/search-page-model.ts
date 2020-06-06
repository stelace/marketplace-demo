import { config } from 'dotenv'
import { join } from 'path'
import { Selector } from 'testcafe'
import VueSelector from 'testcafe-vue-selectors'

const dotEnvFilePath = join(__dirname, "../../", ".env.development");
config({ path: dotEnvFilePath })

export default class SearchModel {
  // VueSelector has no type
  headerInput: any
  headerInputClearIcon: any
  results: any
  modesDropdown: any
  modes: Selector
  filtersButton: any
  filtersResetButton: any
  categoriesSelect: any
  categories: Selector
  filtersSearchButton: any
  delay: number

  constructor() {
    if (process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true') {
      this.headerInput = VueSelector('ref:headerCategoryAutocompleteInput')
      this.headerInputClearIcon = VueSelector(
        'ref:headerCategoryAutocompleteInput ' +
        'ref:categoryAutocompleteClearButton'
      )
    } else {
      this.headerInput = VueSelector('ref:headerSearchInput')
      this.headerInputClearIcon = VueSelector('ref:clearHeaderSearchInput')
    }
    this.results = VueSelector('AssetCard')
    this.modesDropdown = VueSelector('SearchToolbar ref:searchToolbarModes')
    this.modes = Selector('.search-modes .q-item')
    this.filtersButton = VueSelector('ref:searchFiltersToggle')
    this.filtersResetButton = VueSelector('ref:searchFiltersToggle QIcon')
    this.categoriesSelect = VueSelector('SearchToolbar SelectCategories')
    this.categories = Selector('.search-filters__categories .q-item')
    this.filtersSearchButton = VueSelector('SearchToolbar ref:filtersSearchButton')

    this.delay = 3000 // debounce delay + API request
  }
}
