import stelace from 'src/utils/stelace'
import { isNil, isEmpty, isPlainObject, forEach, flatten } from 'lodash'

const defaultAvailabilityFilters = {
  enabled: true,
  fullPeriod: false
}

export const searchAssets = async ({
  page,
  nbResultsPerPage,
  orderBy,
  order,
  location,
  filters = {},
  customAttributesFilters = {},
  query,
  availabilityFilters = defaultAvailabilityFilters
} = {}) => {
  let filter = filters.filter || ''
  const addToFilter = (expression, operator = '&&') => {
    filter += (filter ? ` ${operator} ${expression}` : expression)
  }

  const sortableBuiltIntAttributes = [
    'name',
    'validated',
    'createdDate',
    'price'
  ]
  const apiOrderBy = sortableBuiltIntAttributes.includes(orderBy) ? `_${orderBy}` : orderBy

  const searchParams = {
    page,
    nbResultsPerPage,
    sort: {
      [apiOrderBy]: order
    },
    availabilityFilters
  }

  if (typeof filters.active === 'boolean' || filters.active === null) {
    searchParams.active = filters.active // can disable active filter with null (defaults to true)
  }
  if (filters.validated) searchParams.validated = filters.validated

  if (query) searchParams.query = query
  if (filters.categoryId) searchParams.categoryId = flatten([filters.categoryId])
  if (filters.assetTypeId) searchParams.assetTypeId = flatten([filters.assetTypeId])
  if (filters.similarTo) searchParams.similarTo = flatten([filters.similarTo])
  if (filters.without) searchParams.without = flatten([filters.without])
  if (filters.startDate) searchParams.startDate = filters.startDate
  if (filters.endDate) searchParams.endDate = filters.endDate
  if (Number.isFinite(filters.quantity)) searchParams.quantity = filters.quantity

  if (location && [location.longitude, location.latitude].every(Number.isFinite)) {
    searchParams.location = location
  }

  if (!isEmpty(filters.price)) {
    if (!isNil(filters.price.gte)) addToFilter(`_price >= ${filters.price.gte}`)
    if (!isNil(filters.price.lte)) addToFilter(`_price <= ${filters.price.lte}`)
  }

  // Implicitly joining equality expression with AND.
  // Feel free to improve this to support more Stelace Search filter expressions
  forEach(customAttributesFilters, (value, name) => {
    if (!isNil(value) && !isPlainObject(value)) addToFilter(`${name} == ${value}`)
  })

  if (filter) searchParams.filter = filter

  const assets = await stelace.search.list(searchParams)
  return assets
}
