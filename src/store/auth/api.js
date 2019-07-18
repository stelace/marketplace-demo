import { sortBy } from 'lodash'
import stelace from 'src/utils/stelace'

export async function fetchCurrentUserWithOrganizations (userId) {
  const naturalUser = await stelace.users.read(userId, { stelaceOrganizationId: null })

  // `naturalUser.organizations[orgId]` can be null after organization removal
  const organizationsIds = Object.keys(naturalUser.organizations)
    .filter(orgId => !!naturalUser.organizations[orgId])

  const promises = organizationsIds.map(organizationId => {
    return stelace.users.read(organizationId, { stelaceOrganizationId: organizationId })
  })

  const organizations = await Promise.all(promises)

  return {
    naturalUser,
    organizations: sortBy(organizations, org => org.createdDate)
  }
}
