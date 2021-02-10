require('dotenv').config({ path: '.env.development' })
const { execSync } = require('child_process')

// Netlify ID set with Netlify CLI will automatically be used, unless you have
// a specific NETLIFY_ID_FOR_PRODUCTION set in .env.production you want to deploy to.
const specificDevId = process.env.NETLIFY_ID_FOR_DEV
const setNetlifyProjectId = specificDevId
  ? `cross-env NETLIFY_SITE_ID=${specificDevId} ` : ''

execSync(
  // --prod param means Netlify won’t generate a specific URL for deployment,
  // unlike plain npm run deploy,
  // but deploy to main project URL like yourwebsite.netlify.com or yourwebsite.com
  `${setNetlifyProjectId}netlify deploy --prod --dir=dist/spa`,
  { stdio: 'inherit' }
)
