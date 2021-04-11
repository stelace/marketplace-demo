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
  // used to refresh app when contents change
  lastContentUpdatedDate: '',

  addedRoutes: [],

  maxUploadFileSize: Math.pow(1024, 2) * 10, // 10 MB

  appUpdateAvailable: false,
  appUpdateNoCache: true,

  placeholderImageBaseUrl: 'https://placeimg.com',
  acceptWebP: true,
  // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
  blankImageBase64: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',

  contentEditing: false,

  // from post message
  editingEntries: {},
  selectedEntry: {},
  messageOrigin: null,
}
