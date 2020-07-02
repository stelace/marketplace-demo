# Performance

The app must load in no more than a few seconds on a 3G connection.

In July 2020, the app hits a 90+ Google PageSpeed/Lighthouse score on Desktop (with 3G connection).

Here are some tips to keep a high score.

## Pre-rendering

Landing pages are pre-rendered at build time using `prerender-spa-plugin` so we can get the best of both worlds without bothering with server-side rendering:

- Static pages for easy deployment and scaling, minimal maintenance and fast page load
- Vue.js SPA for seamless navigation and user experience

After the HTML is loaded Vue takes it over and hydrates into a full Vue.js SPA.
JS code-splitted chunks are loaded on demand during navigation.

## Code splitting

Webpack helps a lot with [code splitting](https://webpack.js.org/guides/code-splitting/), so we can lazily load Vue [routes](https://router.vuejs.org/guide/advanced/lazy-loading.html) and [components](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components).

This is critical when dealing with heavy components such as map:

```js
// no need to import('mapbox-gl-vue') if component is wrapped in some inactive v-if block
// We lazyload Mapbox when component is getting mounted

export default {
  …
  components: {
    Mapbox: () => import(/* webpackChunkName: 'mapbox' */ 'mapbox-gl-vue'),
    …
  },
  …
}
```

Most dependencies are moved into webpack vendor chunk, but we can manually exclude some heavy ones only used in few parts of the app such as map above, in `quasar.conf.js`.

You can also import some dependencies dynamically in any part of your code:

```js
import(/* webpackChunkName: 'somePartOfTheApp' */ 'axios')
  .then(axios => axios.get(…).then(…))
```

In `quasar.conf.js`, `build.analyze: true` option can be very useful to see all chunks and spot most heavy ones
with [Webpack bundle analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) once `quasar build` completes.

## Preconnect, prefetch, preload hints

We use these resource hints in `index.html.template` to allow faster app loading.

We optimized webpack config for performance by loading .js, .css, fonts and translations in appropriate order.

Please refer to `quasar.conf.js` where we changed the default webpack config.
