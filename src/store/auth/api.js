import { sortBy } from 'lodash'
import stelace from 'src/utils/stelace'

export async function fetchCurrentUserWithOrganizations (userId) {
  const naturalUser = await stelace.users.read(userId, { stelaceOrganizationId: null })

  const organizationsIds = Object.keys(naturalUser.organizations)

  const promises = organizationsIds.map(organizationId => {
    return stelace.users.read(organizationId, { stelaceOrganizationId: organizationId })
  })

  const organizations = await Promise.all(promises)

  return {
    naturalUser,
    organizations: sortBy(organizations, org => org.createdDate)
  }
}
