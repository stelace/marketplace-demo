const collection = 'website'
const emailCollection = 'email'
const prefixSeparator = '-'

module.exports = {
  collection,
  emailCollection,
  defaultFilePrefix: 'default' + prefixSeparator,
  emailFilePrefix: emailCollection + prefixSeparator
}
