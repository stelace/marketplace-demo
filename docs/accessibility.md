# Accessibility

Great care is required when handling with accessibility, including:

- Forms
- Focus and keyboard navigation
- Contrasts
- Screen-readers

## Forms

Inputs and other form elements must be wrapped in HTML form tags with main form button having `type="submit"` attribute.

Vue can be used to prevent default browser refresh behavior with `@submit.prevent="optionalMethod"` on form element.

## Focus

Use native `<button/>` rather than `<div/>` or `<span/>` tag with click handlers.

When it’s necessary to build custom interactive elements, you can use `tabindex="0"` to allow sensible keyboard navigation.

## Contrast

When authoring and styling content, remind that fancy background colors or colorblindness can change the way users see your work.

Tools like [Chrome Dev Tools](https://developers.google.com/web/tools/chrome-devtools/accessibility/reference##contrast) or Lighthouse can make it easier to test.

## Screen-readers

ARIA helps making HTML more accessible.
Fortunately Quasar components integrate a few ARIA attributes but [much more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) can be done.
