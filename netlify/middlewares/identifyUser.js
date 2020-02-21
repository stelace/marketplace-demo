import { initStelaceSdk } from '../../src/utils/stelace'

if (!process.env.STELACE_SECRET_API_KEY) {
  throw new Error('Missing Stelace secret API key')
}

const stelace = initStelaceSdk({
  apiKey: process.env.STELACE_SECRET_API_KEY,
  apiBaseURL: process.env.STELACE_API_URL
})

export default function identifyUser () {
  return {
    before: async ({ event, context }) => {
      const { authorization } = event.headers
      if (!authorization) return

      try {
        const authInfo = await stelace.auth.check({ authorization })
        context.auth = authInfo
      } catch (err) {
        // do nothing
      }
    }
  }
}
