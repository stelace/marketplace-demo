let routes

const instantPathPrefix = process.env.VUE_APP_INSTANT_PAGE_PREFIX

// Exporting this to nest more routes depending on contents fetched from Stelace Content API
// Inspired by @yovchev https://github.com/vuejs/vue-router/pull/2064#issuecomment-462985653
// Waiting for https://github.com/vuejs/vue-router/issues/1156
export const dynamicRoutes = {
  path: instantPathPrefix, // prefixing to prevent routes conflicts in the future
  redirect: '/',
  component: () => import(/* webpackChunkName: 'landing' */ 'layouts/MainLayout.vue'),
  meta: {},
  children: []
}

export const defaultRoutes = {
  path: '/',
  component: () => import(/* webpackChunkName: 'landing' */ 'layouts/MainLayout.vue'),
  meta: {},
  children: [
    {
      name: 'home',
      path: '',
      component: () => import(/* webpackChunkName: 'landing' */ 'pages/Home.vue'),
      meta: {}
    },
    {
      name: 'search',
      path: 's',
      component: () => import(/* webpackChunkName: 'search' */ 'pages/Search.vue'),
      meta: {}
    },
    {
      name: 'asset',
      path: 'a/:id',
      component: () => import(/* webpackChunkName: 'search' */ 'pages/Asset.vue'),
      meta: {
        hasLeftDrawer: true
      }
    },
    {
      name: 'newAsset',
      path: 'n',
      component: () => import(/* webpackChunkName: 'landing' */ 'pages/NewAsset.vue'),
      meta: {}
    },
    {
      name: 'publicProfile',
      path: 'p/:id',
      component: () => import(/* webpackChunkName: 'search' */ 'pages/PublicProfile.vue'),
      meta: {
        hasLeftDrawer: true
      }
    },
    {
      name: 'inbox',
      path: 'i',
      component: () => import(/* webpackChunkName: 'account' */ 'pages/Inbox.vue'),
      meta: {
        mustBeLogged: true
      },
    },
    // Make it a children of inbox if nesting needed for layout
    {
      name: 'conversation',
      path: 'i/:id',
      component: () => import(/* webpackChunkName: 'account' */ 'pages/Conversation.vue'),
      meta: {
        hasLeftDrawer: true,
        mustBeLogged: true
      }
    },
  ]
}

routes = [dynamicRoutes, defaultRoutes] // eslint-disable-line prefer-const

export const catchAllRoute = {
  path: '*',
  component: () => import(/* webpackChunkName: 'landing' */ 'layouts/MainLayout.vue'),
  children: [{
    name: 'notFound',
    path: '',
    component: () => import(/* webpackChunkName: 'landing' */ 'pages/Error404.vue'),
    meta: {},
  }]
}

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push(catchAllRoute)
}

export default routes

/**
 * Returns dynamic route relative path like '/l/terms-and-conditions',
 * or '/' if route is not found.
 * @param {String} name - route name like 'terms'
 * @returns {String} route path
 */
export function getInstantRoutePath (name) {
  const route = dynamicRoutes.children.find(r => r.name === name)
  return route ? `${instantPathPrefix}/${route.path}` : '/'
}
