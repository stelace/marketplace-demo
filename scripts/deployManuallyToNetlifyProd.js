require('dotenv').config({ path: '.env.production' })
const { execSync } = require('child_process')

// Netlify ID set with Netlify CLI will automatically be used, unless you have
// a specific NETLIFY_ID_FOR_PRODUCTION set in .env.production you want to deploy to.
const specificProductionId = process.env.NETLIFY_ID_FOR_PRODUCTION
const setNetlifyProjectId = specificProductionId
  ? `cross-env NETLIFY_SITE_ID=${specificProductionId} ` : ''

// Need to reproduce what we do during Netlify continuous deployments
execSync(`sed -Ei 's/X-Robots-Tag ?= ?"noindex, nofollow"/X-Robots-Tag = "all"/g' netlify.toml`)

execSync(
  // --prod param means Netlify won’t generate a specific URL for deployment,
  // unlike plain npm run deploy,
  // but deploy to main project URL like yourwebsite.netlify.com or yourwebsite.com
  `${setNetlifyProjectId}netlify deploy --prod --dir=dist/spa`,
  { stdio: 'inherit' }
)

// Restore
execSync(`sed -i 's/X-Robots-Tag = "all"/X-Robots-Tag = "noindex, nofollow"/g' netlify.toml`)
