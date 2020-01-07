import { assignWith, get, mapKeys, union } from 'lodash'

import { mergeOrOverwriteAndIgnoreNull } from './merging'

export const TRANSFORMED_KEYS = 'TRANSFORMED_KEYS'

/**
 * This function performs several operations on website translation entries:
 * - flattens all entries and fields, like 'pages' and 'home.title' respectively,
 *   to 'entry.field.path' keys like 'pages.home.title' for easier use
 * - maps content values to transformed fields when they exist + adds corresponding keys to
 *   TRANSFORMED_KEYS in returned entries object
 * @param {Object} [entries.apiEntries] - Expected to have entry names as keys mapping to API Entry objects,
 *   including a `fields` property containing flattened keys like 'home.title' mapping to
 *   content strings or object values (for transformed contents)
 * @param {Object} [entries.localEntries] - Expected to have entry names as keys, _directly_ mapping to
 *   objects of string and objects properties (unlike Content API Entry having nested `fields`).
 * @param {Object} [entries.editingEntries] - Expected to have entry names as keys, _directly_ mapping to
 *   objects of string and objects properties (same as `localEntries`).
 * @param {Boolean} [useRawFields] - If true, field keys map to field strings _or_ raw objects
 *   rather than extracting strings from transformed fields (like markdown fields).
 * @returns entries object
 */
export function mergeEntries ({ apiEntries = {}, localEntries = {}, editingEntries = {}, useRawFields }) {
  const allEntries = { [TRANSFORMED_KEYS]: {} }
  const allEntryNames = union(Object.keys(localEntries), Object.keys(apiEntries), Object.keys(editingEntries))
    .filter(k => k !== TRANSFORMED_KEYS)

  allEntryNames.forEach(name => {
    // Note that this is just a shallow merge
    const entry = assignWith(
      {},
      localEntries[name], // local entry directly maps to fields
      get(apiEntries[name], 'fields'), // api entry can also have metadata ignored here
      editingEntries[name], // editing entry directly maps to fields
      // Every single field can be reset to local default using `null` in apiEntries.
      mergeOrOverwriteAndIgnoreNull
    )
    // Flattening keys to `entryName.field.path`
    Object.assign(allEntries, mapKeys(entry, (v, k) => `${name}.${k}`))
  })

  // Mapping transformed values like HTML rendered from markdown
  Object.keys(allEntries).filter(k => k !== TRANSFORMED_KEYS).forEach(key => {
    const value = allEntries[key]

    if (value === null) return

    // To enable any type of rich-text content, field values can be objects instead of strings,
    // with the following format:
    // {
    //   editable: <any> // e.g. String for 'markdown' transform
    //   transform: <String>, // language to parse, like 'markdown'
    //   transformed: <String>, // like HTML String with 'markdown' transform
    // }
    if (typeof value.transformed === 'string') {
      // We could run transform here but markdown was already pre-rendered to HTML
      // to avoid markdown-it dependency in client bundle
      allEntries[TRANSFORMED_KEYS][key] = value.transform // only 'markdown' is supported currently
      allEntries[key] = useRawFields ? value
        // Unescape ICU Message Format values (allowing dynamic URLs in markdown too)
        : value.transformed.replace(/"%7B([^"\s]+)%7D"/, '"{$1}"')
    }
  })

  return allEntries
}
