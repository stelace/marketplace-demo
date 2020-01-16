import { Selector } from 'testcafe'
import VueSelector from 'testcafe-vue-selectors'

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
    this.headerInput = VueSelector('ref:headerSearchInput')
    this.headerInputClearIcon = VueSelector('ref:clearHeaderSearchInput')
    this.results = VueSelector('AssetCard')
    this.modesDropdown = VueSelector('SearchToolbar ref:searchToolbarModes')
    this.modes = Selector('.search-modes .q-item')
    this.filtersButton = VueSelector('ref:searchFiltersToggle')
    this.filtersResetButton = VueSelector('ref:searchFiltersToggle QIcon')
    this.categoriesSelect = VueSelector('SearchToolbar SelectCategories')
    this.categories = Selector('.search-filters__categories .q-item')
    this.filtersSearchButton = VueSelector('SearchToolbar ref:filtersSearchButton')

    this.delay = 1500 // debounce delay + API request
  }
}
