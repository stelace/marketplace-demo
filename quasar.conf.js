const dotenv = require('dotenv')
const PreloadPlugin = require('preload-webpack-plugin')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin')
const path = require('path')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const deleteFile = util.promisify(fs.unlink)
const renameFile = util.promisify(fs.rename)
const { execSync } = require('child_process')
const _ = require('lodash')
const glob = require('glob')
const pMap = require('p-map')

const netlifyServe = require('./netlify/ci/serve')
const serveNetlifyLambda = process.env.NETLIFY_LAMBDA === 'true'

// const chalk = require('chalk')
const log = console.log

// const apiKey = process.env.STELACE_PUBLISHABLE_API_KEY || ''
// const stelaceEnv = apiKey.includes('_live_') ? 'live' : 'test'

// Configuration for your app

module.exports = function (ctx) {
  dotenv.config({
    path: ctx.dev ? '.env.development' : '.env.production'
  })

  // Ensuring we have local translations up-to-date. Runs once.
  execSync(`npm run translate${ctx.dev ? ':dev' : ':prod'}`, { stdio: 'inherit' })

  // Upload latest translations in default locale to enable Stelace Dashboard editing
  // This must be done manually in production
  if (ctx.dev && process.env.STELACE_SECRET_API_KEY) {
    execSync(`npm run deploy:translations${ctx.dev ? ':dev' : ':prod'}`, { stdio: 'inherit' })
  }

  // Include API resources in build to save hundreds of milliseconds when loading app.
  // This means that app may have to be rebuilt and deployed again when updating Config,
  // Asset Types or Custom Attributes
  execSync(`npm run conf${ctx.dev ? ':dev' : ':prod'}`, { stdio: 'inherit' })

  // ///////// //
  // Dev tools //
  // ///////// //

  // Ensuring proper routing depending on deploy context
  // https://www.netlify.com/docs/continuous-deployment/#environment-variables
  const netlifyPreviewBranches = ['dev']
  const netlifyUrl = process.env.DEPLOY_PRIME_URL
  let websiteUrl = process.env.STELACE_INSTANT_WEBSITE_URL
  if (netlifyUrl && netlifyPreviewBranches.some(b => netlifyUrl.includes(`${b}--`))) {
    websiteUrl = netlifyUrl
  }

  const uploadSourceMapsToSentry = [
    'SENTRY_AUTH_TOKEN',
    'SENTRY_ORG',
    'SENTRY_PROJECT'
  ].every(v => Boolean(process.env[v]))

  let commitSHA = ''
  try {
    commitSHA = execSync('git rev-parse HEAD').toString().trim()
  } catch (e) {
    log('\nCould not retrieve git commit SHA.\n')
  }

  // //////////// //
  // HTML content //
  // //////////// //

  const prerender = ctx.prod && ctx.mode.spa

  const defaultStyles = JSON.parse(fs.readFileSync('src/styles.json', 'utf-8'))
  const localTranslations = JSON.parse(fs.readFileSync(`src/i18n/build/${
    process.env.VUE_APP_DEFAULT_LANGUAGE || 'en'
  }.json`, 'utf-8'))
  const injectServiceName = (str) => {
    if (str) return str.replace(/({SERVICE_NAME})/, process.env.VUE_APP_SERVICE_NAME || '$1')
    return ''
  }

  const fonts = ['userFontNormal', 'userFontMedium', 'userFontBold']
  const woff2Ext = '.woff2'
  const googleFonts = []

  fonts.forEach(f => {
    const fontUrl = defaultStyles[f]
    if (!fontUrl) return

    const isWoff2 = fontUrl.indexOf(woff2Ext, fontUrl.length - woff2Ext.length) !== -1
    if (isWoff2) googleFonts.push(fontUrl)
  })

  const primaryColor = defaultStyles.primaryColor || '#1055b6'
  const loadingScreen = {
    title: injectServiceName(_.get(localTranslations.pages, 'home.header', '')),
    notice: injectServiceName(_.get(localTranslations.status, 'loading', '')),
    javascriptRequired: injectServiceName(_.get(localTranslations.error, 'javascript_required', '')),
  }
  const seo = {
    ogDesc: injectServiceName(_.get(localTranslations.pages, 'home.meta_description', '')),
    ogImage: defaultStyles.homeHeroUrl,
    websiteUrl: process.env.STELACE_INSTANT_WEBSITE_URL
  }

  const apiBaseUrl = process.env.STELACE_API_URL || 'https://api.stelace.com'
  const cdnUrl = process.env.VUE_APP_CDN_WITH_IMAGE_HANDLER_URL ||
    'https://cdn.stelace.com/'
  const cdnUploadUrl = process.env.VUE_APP_CDN_POLICY_ENDPOINT ||
    'https://upload.instant.stelace.com/upload/policy'
  const cdnS3Bucket = process.env.VUE_APP_CDN_S3_BUCKET || 'stelace-instant-files'

  const postMessageAllowedOrigins = process.env.VUE_APP_POST_MESSAGE_ALLOWED_ORIGINS ||
    'https://stelace.com'

  // ///////////// //
  // Quasar config //
  // ///////////// //

  const splittedVendorDeps = [
    'mapbox',
    'photoswipe',
    'vue-slicksort',
    // logging chunk
    'sentry',
    // socket.io chunk
    'socket.io',
    'engine.io',
  ]

  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'errors',
      'globalMixins',
      'globalComponents',
      'vue-intl',
      'exchangePlugin',
      'vuex-router-sync',
      'vue-meta',
      ctx.dev ? 'devDebug' : null,
      { path: 'fonts', server: false },
      { path: 'analytics', server: false },
    ].concat(prerender ? ['prerendered'] : []),

    css: [
      'app.styl'
    ],

    extras: [
      // Only include used ones with tree-shaking: https://quasar.dev/vue-components/icon#Svg-icons
      // 'material-icons',
      // 'ionicons-v4',
      // 'mdi-v3',
      // 'fontawesome-v5',
      // 'eva-icons'
    ],

    vendor: { // Exclude or add these to vendor chunk
      // disable: false,
      add: [],
      remove: splittedVendorDeps
    },

    // framework: 'all', // --- includes everything; for dev only!
    framework: {
      components: [
        'QAjaxBar',
        'QAvatar',
        'QBadge',
        'QBtn',
        'QBtnDropdown',

        // QCarousel
        'QCarousel',
        'QCarouselControl',
        'QCarouselSlide',

        // QCard
        'QCard',
        'QCardSection',
        // 'QCardActions',

        'QChatMessage',
        'QCheckbox',
        'QChip',
        'QCircularProgress',
        'QDate',
        'QDialog',
        'QDrawer',
        // 'QExpansionItem',
        'QFooter',
        'QHeader',
        'QIcon',
        'QImg',
        'QInput',
        'QLayout',
        'QLinearProgress',

        // ItemList
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QList',

        'QMenu',
        'QNoSsr',
        'QPageContainer',
        'QPageSticky',
        'QPagination',
        'QPopupEdit',
        'QPopupProxy',
        'QPage',
        'QRadio',
        'QRange',
        'QRating',
        'QScrollArea',
        'QSelect',
        'QSeparator',
        'QSkeleton',
        'QSlider',
        'QSpace',
        'QSpinner',

        // Table
        'QTable',
        // 'QTh',
        // 'QTr',
        // 'QTd',

        // Tabs
        'QTabs',
        'QTab',
        // 'QRouteTab',

        // Timeline
        // 'QTimeline',
        // 'QTimelineEntry',

        'QSlideTransition',
        'QToggle',

        // Toolbar
        'QToolbar',
        'QToolbarTitle',

        'QTooltip',
        'QUploader',
        'QUploaderAddTrigger',
      ],

      directives: [
        'ClosePopup',
        'ScrollFire',
        'Ripple'
      ],

      // Quasar plugins
      plugins: [
        'AppVisibility',
        'Dialog',
        // 'Meta', // using vue-meta for compatibility with prerender-spa-plugin
        'Notify',
        'Loading'
      ],

      // Only include used SVG icons with tree-shaking
      // https://quasar.dev/options/quasar-icon-sets#Installing-a-Quasar-Icon-Set
      iconSet: 'svg-material-icons', // default: 'material-icons'
      // lang: 'de' // Quasar language
    },

    htmlVariables: {
      // Preconnecting to improve performance
      apiBaseUrl,
      cdnUrl,

      googleFonts,

      serviceName: process.env.VUE_APP_SERVICE_NAME,
      ogDesc: seo.ogDesc,
      ogImage: seo.ogImage,
      websiteUrl: seo.websiteUrl,
      primaryColor,

      javascriptRequired: loadingScreen.javascriptRequired || 'Please activate JavaScript',
    },

    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // htmlFilename: 'index.html',
      sourceMap: ctx.dev || uploadSourceMapsToSentry,
      devtool: ctx.dev ? 'source-map'
        // remove source map references from bundle when uploading .map files to sentry
        // instead of using default quasar setting '#source-map' when sourceMap option is enabled
        : (uploadSourceMapsToSentry ? '#hidden-source-map' : '#source-map'),
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,

      async afterBuild () {
        // Delete source map files once uploaded to sentry
        // Remove these lines if you need to serve source map in production.
        // Then you may need to adjust webpack devtool build option
        if (uploadSourceMapsToSentry) {
          const mapFiles = glob.sync('dist/**/*.map')
          await pMap(mapFiles, async (f) => {
            await deleteFile(path.join(__dirname, f))
          })
          // It seems we need to manually remove source map references in CSS files
          // eslint-disable-next-line
          execSync(`find . -name "*.css" -type f | xargs sed -i -e '/\\/\\*.*sourceMappingURL.*\\*\\//d'`)
        }

        if (prerender) {
          const spa = path.join(__dirname, 'dist/spa')
          // preserve non-prerendered version of index.html before prerendering
          // cf. app.html served in netlify.toml for more info
          await renameFile(path.join(spa, 'index.html'), path.join(spa, 'app.html'))
          await renameFile(path.join(spa, 'home.html'), path.join(spa, 'index.html'))

          const removeTmpTags = html => html
            .replace(/\s*<([a-z]+) [^>]*data-removed-during-build.*>([^<]|\s)*<\/\1>/gm, '')
          const prerendered = glob.sync('dist/spa/**/*.html')
          await pMap(prerendered, async (f) => {
            const p = path.join(__dirname, f)
            const html = await readFile(p, 'utf8')
            await writeFile(p, removeTmpTags(html), 'utf8')
          })
        }
      },

      transpileDependencies: [
        /sharp-aws-image-handler-client/
      ],

      extendWebpack (cfg, { isClient }) {
        if (ctx.prod) {
          // spare debug dependency
          cfg.resolve.alias['socket.io-client'] = path.resolve(
            __dirname,
            './node_modules/socket.io-client/dist/socket.io.slim.js'
          )
        }

        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })

        if (uploadSourceMapsToSentry) {
          cfg.plugins.push(new SentryWebpackPlugin({
            include: 'dist/spa',
            ignore: ['node_modules']
          }))
        }

        if (prerender) {
          cfg.plugins.push(
            new PrerenderSPAPlugin({
              // https://github.com/chrisvfritz/prerender-spa-plugin#plugin-options
              staticDir: path.join(__dirname, 'dist/spa'),
              routes: [
                '/', // Home
                '/s', // Search
              ],
              postProcess: context => {
                // Defer scripts and tell Vue it's been server rendered to trigger hydration
                context.html = context.html
                  .replace(/<script (.*?)>/g, '<script $1 defer>')
                  .replace('id="q-app"', 'id="q-app" data-server-rendered="true"')

                if (context.route === '/') {
                  context.outputPath = path.join(__dirname, 'dist/spa', 'home.html')
                }
                return context
              },
              minify: {
                collapseWhitespace: true,
                conservativeCollapse: true,
                minifyJS: true,
              },
              renderer: new Renderer({
                inject: { isPrerendering: true },
                injectProperty: '__PRERENDER_INJECTED', // default
                renderAfterDocumentEvent: 'prerender-ready'
              })
            })
          )

          const criticalCSSConfig = {
            // https://github.com/addyosmani/critical#options
            inline: true,
            minify: true,
            extract: false,
            dimensions: [{
              height: 565,
              width: 360
            },
            {
              height: 1080,
              width: 1360
            }],
            penthouse: {
              blockJSRequests: false,
              keepLargerMediaQueries: true,
              forceInclude: [
                // footer styles
                /stl-footer/,
                '.bg-accent-gradient',
                // skeleton styles
                /q-skeleton/,
                '.fit',
                // typography
                /text-[a-z0-9]+/ // excluding precise color classes such as '.text-orange-4'
              ],
              /* screenshots: {
                basePath: 'criticalcss',
              } */
            }
          }
          cfg.plugins.push(new HtmlCriticalWebpackPlugin({
            base: path.resolve(__dirname, 'dist/spa'),
            src: 'home.html',
            dest: 'home.html',
            ...criticalCSSConfig
          }))
          cfg.plugins.push(new HtmlCriticalWebpackPlugin({
            base: path.resolve(__dirname, 'dist/spa/s'),
            src: 'index.html',
            dest: 'index.html',
            ...criticalCSSConfig
          }))
        }
      },

      // Performance: customizing resource hints to preload/prefetch Stelace Instant translations
      // and other files if needed
      chainWebpack (chain) {
        if (ctx.prod) {
          // remove default quasar resource hints
          chain.plugins.delete('preload')
          chain.plugins.delete('prefetch')

          const stelaceI18nRegex = new RegExp(`i18n-stl-${
            process.env.VUE_APP_DEFAULT_LANGUAGE || 'en'
          }`)
          const prefetchChunksRegex = /search/
          const preloadChunksRegex = /(landing|common)/

          chain.plugin('prefetch')
            .use(PreloadPlugin, [{
              rel: 'prefetch',
              include: 'asyncChunks',
              fileWhitelist: [
                prefetchChunksRegex
              ],
              fileBlacklist: [
                /\.map$/, // Don’t forget to add .map files included in default blacklist
                /\.css$/, // using critical+loadCSS
              ]
            }])

          // Very important to chain preloads from least to most important
          // (e.g. vendor after translations)
          chain.plugin('preloadI18n')
            .use(PreloadPlugin, [{
              rel: 'preload',
              fileWhitelist: [
                stelaceI18nRegex
              ],
            }])
          chain.plugin('preloadLanding')
            .use(PreloadPlugin, [{
              rel: 'preload',
              fileWhitelist: [
                // Ensures landing pages are loaded as fast as possible
                preloadChunksRegex
              ],
              fileBlacklist: [
                /\.map$/, // Don’t forget to add .map files included in default blacklist
                /\.css$/, // using critical+loadCSS
              ]
            }])
          // Most important files last
          chain.plugin('preload')
            .use(PreloadPlugin, [{
              rel: 'preload',
              include: 'initial',
              fileBlacklist: [
                /\.map$/,
                /hot-update\.js$/,
                /\.css$/, // using critical+loadCSS
              ]
            }])
        }
      },

      // Explicit environment variable is required (unlike VueCLI when using VUE_APP prefix)
      env: {
        STELACE_API_URL: apiBaseUrl,
        STELACE_PUBLISHABLE_API_KEY: process.env.STELACE_PUBLISHABLE_API_KEY,
        STELACE_INSTANT_WEBSITE_URL: websiteUrl,
        CONTEXT: process.env.CONTEXT,
        DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
        STELACE_PUBLIC_PLATFORM_ID: process.env.STELACE_PUBLIC_PLATFORM_ID,
        VUE_APP_SSO_PROVIDERS: process.env.VUE_APP_SSO_PROVIDERS,
        VUE_APP_SSO_LOGIN_ONLY: process.env.VUE_APP_SSO_LOGIN_ONLY,
        VUE_APP_SERVICE_NAME: process.env.VUE_APP_SERVICE_NAME,
        VUE_APP_MAPBOX_STYLE: process.env.VUE_APP_MAPBOX_STYLE,
        VUE_APP_MAPBOX_TOKEN: process.env.VUE_APP_MAPBOX_TOKEN,
        VUE_APP_MAP_CENTER_COORDINATES: process.env.VUE_APP_MAP_CENTER_COORDINATES,
        VUE_APP_DISABLE_AUTO_SEARCH_ON_MAP_MOVE: process.env.VUE_APP_DISABLE_AUTO_SEARCH_ON_MAP_MOVE,
        VUE_APP_DEFAULT_LANGUAGE: process.env.VUE_APP_DEFAULT_LANGUAGE,
        VUE_APP_LOCALE_SWITCH: process.env.VUE_APP_LOCALE_SWITCH,
        VUE_APP_DEFAULT_CURRENCY: process.env.VUE_APP_DEFAULT_CURRENCY,
        VUE_APP_DEBUG_STYLES: process.env.VUE_APP_DEBUG_STYLES,
        VUE_APP_USE_PROD_FONTS_CSS: process.env.VUE_APP_USE_PROD_FONTS_CSS,
        VUE_APP_NOMINATIM_HOST: process.env.VUE_APP_NOMINATIM_HOST,
        VUE_APP_NOMINATIM_KEY: process.env.VUE_APP_NOMINATIM_KEY,
        VUE_APP_SENTRY_LOGGING_DSN: process.env.VUE_APP_SENTRY_LOGGING_DSN,
        VUE_APP_GIT_COMMIT_SHA: commitSHA,
        VUE_APP_GOOGLE_ANALYTICS_ID: process.env.VUE_APP_GOOGLE_ANALYTICS_ID,
        VUE_APP_GOOGLE_ANALYTICS_DEBUG: process.env.VUE_APP_GOOGLE_ANALYTICS_DEBUG,
        VUE_APP_CDN_POLICY_ENDPOINT: cdnUploadUrl,
        VUE_APP_CDN_WITH_IMAGE_HANDLER_URL: cdnUrl,
        VUE_APP_CDN_S3_BUCKET: cdnS3Bucket,
        VUE_APP_CDN_S3_DEV_BUCKET: process.env.VUE_APP_CDN_S3_DEV_BUCKET,
        VUE_APP_CDN_UPLOAD_PREFIX: process.env.VUE_APP_CDN_UPLOAD_PREFIX,
        VUE_APP_SEARCH_BY_CATEGORY: process.env.VUE_APP_SEARCH_BY_CATEGORY,
        VUE_APP_DISABLE_RATINGS: process.env.VUE_APP_DISABLE_RATINGS,
        VUE_APP_INSTANT_PAGE_PREFIX: '/l',
        VUE_APP_POST_MESSAGE_ALLOWED_ORIGINS: postMessageAllowedOrigins,
        VUE_APP_GITHUB_FORK_BUTTON: process.env.VUE_APP_GITHUB_FORK_BUTTON,
        VUE_APP_DISPLAY_ASSET_DISTANCE: process.env.VUE_APP_DISPLAY_ASSET_DISTANCE,
        VUE_APP_HOME_FEATURES_COLUMNS: process.env.VUE_APP_HOME_FEATURES_COLUMNS,
        VUE_APP_STRIPE_PUBLISHABLE_KEY: process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY,
        VUE_APP_STRIPE_OAUTH_CLIENT_ID: process.env.VUE_APP_STRIPE_OAUTH_CLIENT_ID,

        NETLIFY_FUNCTION_GET_STRIPE_CUSTOMER_URL: process.env.NETLIFY_FUNCTION_GET_STRIPE_CUSTOMER_URL,
        NETLIFY_FUNCTION_CREATE_STRIPE_CHECKOUT_SESSION_URL: process.env.NETLIFY_FUNCTION_CREATE_STRIPE_CHECKOUT_SESSION_URL,
        NETLIFY_FUNCTION_LINK_STRIPE_ACCOUNT: process.env.NETLIFY_FUNCTION_LINK_STRIPE_ACCOUNT,
      }
    },

    devServer: {
      // https: true,
      // port: 8080,
      open: false, // opens browser window automatically

      // For development, proxy routes to Netlify functions to the server started by `netlify-lambda`
      proxy: ctx.dev && !serveNetlifyLambda ? {
        // Netlify endpoints are available on port 9000
        // so we proxy URLs beginning with '/.netlify' to this port
        // https://github.com/netlify/netlify-lambda#netlify-lambda-serve-legacy-command-proxying-for-local-development
        '/.netlify': {
          target: 'http://localhost:9000',
          pathRewrite: { '^/.netlify/functions': '' }
        }
      } : undefined,

      // For CI, we don't proxy the routes to `netlify-lambda` because CircleCI machine may not
      // have enough memory to handle both
      // so serve Netlify built functions with Quasar process
      // https://webpack.js.org/configuration/dev-server/#devserverbefore
      before: serveNetlifyLambda ? (app) => { netlifyServe.run(app) } : undefined,
    },

    // animations: 'all' --- includes all animations
    animations: ['fadeInLeft', 'fadeInRight', 'fadeInUp'],

    preFetch: true,

    ssr: {
      pwa: false
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        name: 'Stelace',
        short_name: 'Stelace',
        description: 'Platforms built to last',
        start_url: './?utm_source=web_app_manifest',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#005298',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    cordova: {
      // id: 'org.cordova.quasar.app'
    },

    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      }
    }
  }
}
