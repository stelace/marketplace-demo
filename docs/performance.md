# Performance

The app must load in no more than a few seconds on a 3G connection.

On May 2019, the app hits a 95 Google PageSpeed/Lighthouse score on Desktop with 3G connection.

Here are some tips to keep a high score.

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

Most dependencies are moved into webpack vendor chunk, but we can manually exclude some heavy ones only used in few parts of the app such as map above.

You can also import some dependencies dynamically in any part of your code:

```js
import(/* webpackChunkName: 'somePartOfTheApp' */ 'axios')
  .then(axios => axios.get(…).then(…))
```

Quasar also allows to exclude and include dependencies from vendor chunk in `quasar.conf.js` if needed but webpack chunk names offer more granular control.

In the same quasar file, `build.analyze: true` can be very useful to see all chunks and spot most heavy ones
with [Webpack bundle analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) once `quasar build` completes.

## Preconnect, prefetch, preload hints

We use these resource hints in `index.html.template` to allow faster app loading.

We optimized webpack config for performance: we load .js, .css, fonts and translations in appropriate order.

Please refer to `quasar.conf.js` where we changed the default webpack config.
