export default {
  locale: '',
  currency: '',
  fetchingContentStatus: false,

  defaultLocale: 'en',
  defaultCurrency: 'USD',

  // from local JSON translation files
  localEntries: {},

  // from Content Entry API
  apiEntries: {},

  addedRoutes: [],

  maxUploadFileSize: Math.pow(1024, 2) * 10, // 10 MB

  appUpdateAvailable: false,
  appUpdateNoCache: true,

  placeholderImageBaseUrl: 'https://placeimg.com',
  acceptWebP: false,

  contentEdition: false,

  // from post message
  editingEntries: {},
  selectedEntry: {},
  messageOrigin: null,
}
