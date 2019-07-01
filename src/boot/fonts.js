import styles from 'src/styles.json'

export default () => {
  // Tip: on production, it’s much better to include chosen font manually performance-wise
  if (process.env.PROD || process.env.VUE_APP_USE_PROD_FONTS_CSS) {
    import(/* webpackChunkName: 'app-fonts' */ 'src/css/fonts.styl')
  } else if (process.env.DEV) { // Quasar will automatically exclude this from production build
    import('webfontloader').then(WebFontLoader => {
      WebFontLoader.load({
        google: {
          families: [`${styles.userFont}:400,500,700&display=${styles.userFontDisplay}`]
        }
      })
    })
  }
}
