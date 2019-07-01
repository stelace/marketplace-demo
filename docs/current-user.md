# Current user

The current user cannot be known on server side because authentication tokens are stored in browser’s local storage.

All page components use the mixin `src/mixins/authenticatedRoute.js` where the current user is fetched on client-side.

If you need to apply logic depending on the current user, please use `afterAuth` method in the component
instead of the usual `mounted`.

`afterAuth` will automatically be called once current user is fetched (or couldn’t be).
