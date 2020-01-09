import VueSelector from 'testcafe-vue-selectors'

export default class HomeModel {
  // VueSelector has no type
  searchInput: any
  searchButton: any

  constructor() {
    this.searchInput = VueSelector('ref:heroSearchInput')
    this.searchButton = VueSelector('ref:heroSearchButton')
  }
}
