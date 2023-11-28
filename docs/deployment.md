# Deployment

You can deploy manually with Netlify. Install [Netlify CLI](https://github.com/netlify/cli) if needed `npm install -g netlify-cli`, then login with `netlify login` and just run the following:

```sh
npm run deploy
# or
yarn deploy

# for production website
npm run deploy:prod
```

**Note**: Please stop the Quasar development process (`quasar dev`) before build/deploy to prevent the wrong environment file from being used.

Of course you can also deploy manually without Netlify by just using `yarn build` and publish the dist folder with another hosting provider.

## Logging

This template includes integration with [Sentry](https://sentry.io) to make it much easier to debug your code in production environment.

Have a look at `.env.example` to set appropriate variables and enable the integration.
