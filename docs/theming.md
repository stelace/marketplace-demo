# Theming

## styles.json

Theme customization is easy with this file located in `src`, so that your theme can offer many variations using the same layout.

Some context is provided in `src/styles.json.md` comments file.

### Live styles

With Stelace Instant you can edit and store `styles.json` values using _Config_ API, so users can see any changes live, like background or text color updates.

You just have to build your app with styles.json default values, overridden by those saved in _Config_ when app is served (_Config_ values are merged into `styles` Vue store).

## Font

In dev environment font is loaded using [Webfontloader](https://github.com/typekit/webfontloader) and Google Fonts, so you can easily try several fonts.

You can simply edit `userFont` property in `styles.json` with font name available in Google Fonts.

Then you can set your font files for production in `styles.json` variables to be automatically injected as `$font-face` rules, with [`font-display: fallback` CSS rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) by default to ensure both fast rendering and minimum Flash Of Unstyled Text (FOUT).

For more details please refer to `styles.json.md` and `fonts.styl` that is used in production environment for best performance.

Please try to include fonts in regular, medium and bold versions (generally 400, 500, 700 respectively) if available for smooth rendering.
