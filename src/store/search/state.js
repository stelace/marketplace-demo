const priceDefaultMin = 0
const priceDefaultMax = 10000

export default {
  showSearchMap: false,
  userShowSearchMap: null, // Boolean means user has explicitly set map visibility
  // for consistent map display status during navigation.
  // Otherwise map could show up again despite showSearchMap previously set to false
  // Both of these variables enable to show map dynamically (like screen size detection).

  showFilterDialog: false,
  query: '',

  queryLocation: '',
  latitude: null,
  longitude: null,

  mapCenterLatitude: null,
  mapCenterLongitude: null,
  defaultMaxDistance: 150000, // 150km
  maxDistance: null,

  useMapCenter: false,

  searchMode: null,
  displayCustomAttributes: [],
  assetTypesIds: [],

  startDate: '',
  endDate: '',
  displayPriceRange: {
    min: priceDefaultMin,
    max: priceDefaultMax
  },
  priceRange: {
    min: priceDefaultMin,
    max: priceDefaultMax
  },
  priceDefaultMin,
  priceDefaultMax,

  searchFilters: {
    page: 1,
    nbResultsPerPage: 24,
    orderBy: 'createdDate',
    order: 'desc',
    filters: {},
    customAttributesFilters: {}
  },
  paginationMeta: {
    nbResults: 0,
    nbPages: 1
  },

  assets: [],
  usersById: {},
}
