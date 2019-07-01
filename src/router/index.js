import Vue from 'vue'
import VueRouter from 'vue-router'
import { isEmpty } from 'lodash'

import routes from './routes'

Vue.use(VueRouter)

// useful when router is needed outside components despite not creating singleton here to allow SSR
let appRouter = {}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  appRouter = isEmpty(appRouter) ? Router : appRouter

  return Router
}

export {
  appRouter as router
}
