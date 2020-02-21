import { netlifyEnvVars } from '../stored-env'

export function loadNetlifyEnv () {
  // do not override defined `process.env` properties
  for (const prop in netlifyEnvVars) {
    if (typeof process.env[prop] === 'undefined') {
      process.env[prop] = netlifyEnvVars[prop]
    }
  }
}
