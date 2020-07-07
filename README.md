[![Stelace-platform-runner](https://user-images.githubusercontent.com/12909094/59638847-c41f1900-9159-11e9-9fa5-6d7806d57c92.png)](https://stelace.com)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/stelace/marketplace-demo)

# Marketplace starter kit

> This Stelace starter kit is free to use, under the terms of the [MIT license](./LICENSE).
Feel free to [fork](
  https://app.netlify.com/start/deploy?repository=https://github.com/stelace/marketplace-demo
), contribute or just make it your own :heart:.

---

[![CircleCI](https://circleci.com/gh/stelace/marketplace-demo.svg?style=svg)](https://circleci.com/gh/stelace/marketplace-demo)[ ![Netlify Status](https://api.netlify.com/api/v1/badges/b3500c61-82b1-4cdd-a002-890a718ad5ea/deploy-status)](
  https://app.netlify.com/sites/stelace-marketplace-test/deploys
)[ ![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](
  https://conventionalcommits.org
)

This starter kit offers **a [high-performance](#fast-by-default-checkered_flag) AirBnB-like marketplace front-end (Vue.js) with pre-configured serverless deployment** based on [open-source](https://github.com/stelace/stelace) [Stelace API](https://stelace.com) server.

## Contents

- [Features :gift:](#features-gift)
  - [Fast by default :checkered_flag:](#fast-by-default-checkered_flag)
  - [Integrations](#integrations)
- [Testing](#testing)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Deployment](#deployment)

[![marketplace-demo-screenshot](https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/22d115c4e340b125120ce0f29ab36db8-stelace-marketplace-demo-laptop.png)](https://marketplace.demo.stelace.com)

__[Live Demo](https://marketplace.demo.stelace.com)__

A platform template focused on search, automation and real-time is [also available](https://github.com/stelace/heroes-platform-demo).

**What is Stelace?**

[Stelace API](https://stelace.com/) provides advanced search, asset and user management, automation and content delivery APIs for Web platforms ranging from search-intensive marketplaces to online community apps.
Stelace [open-source marketplace backend](https://github.com/stelace/stelace) lets you focus on what makes your platform unique.

[API Docs](https://stelace.com/docs)

---

## Features :gift:

- [Asset](https://stelace.com/docs/assets) management. _Assets_ can be anything from flats and homes to cars or concerts
- Powerful and typo-tolerant [Search](https://stelace.com/docs/search) :mag:, on a relevance _and_ dynamic availability basis
- [User](https://stelace.com/docs/users) authentication including social login & SSO
- User management and [Ratings](https://stelace.com/docs/ratings) :star:
- Real-time [Events](https://stelace.com/docs/command/events) and [Messaging](https://stelace.com/docs/messages)
- Automation with Stelace [Workflows](https://stelace.com/docs/command/workflows) :traffic_light:
- Customizable payment process using serverless functions
- Headless CMS :page_with_curl: with Stelace [Content API](https://stelace.com/docs/content)
- Global CDN for images and user files
- i18n :earth_africa: and full [translations](./docs/i18n.md)
- [Accessibility](./docs/accessibility.md)
- …
- and [much more](https://stelace.com) with Stelace API

### Fast by default :checkered_flag:

Get 90+ PageSpeed score out of the box:

- Pre-rendered static pages for fastest page load, with Vue.js hydrating into full SPA.
- Code-splitting with optimized Webpack config in `quasar.conf.js`.
- Image compression using WebP and serverless resizing using AWS Lambda
- Ressource prefetching and preloading
- PWA-ready thanks to Quasar

This kit follows the [PRPL pattern](https://web.dev/apply-instant-loading-with-prpl/): more info in [docs](./docs/performance.md).

### Integrations

Leverage these integrations to start running your platform even faster:

- Automated and continuous deployment with [Netlify](https://www.netlify.com/)
- [Stripe](https://stripe.com/) payments using [Netlify functions](https://docs.netlify.com/functions/overview/) and Stelace workflows
- [Sentry](https://sentry.io/) for debugging in production environment
- Maps and place search with [OpenStreetMap](https://www.openstreetmap.org/) providers
- Google Analytics

## Testing

- End-to-end cross-browser testing with [TestCafé](https://devexpress.github.io/testcafe)
- Continuous integration with [CircleCI](https://circleci.com/)

## Stack

Serverless [JAMStack architecture](https://jamstack.org/):

- [Vue.js](https://github.com/vuejs/vue)
- [Quasar](https://github.com/quasarframework/quasar) framework
- [Stelace API](https://stelace.com) as backend
- [Stelace headless CMS](https://stelace.com/docs/content)
- [Stelace.js](https://github.com/stelace/stelace.js) SDK
- [Netlify](https://www.netlify.com/) for static site and lambda functions deployment

Node.js >= 10.18 is used for tooling.

## Getting started

You need your Stelace API keys to get started. Good news: Stelace is [open-source](https://github.com/stelace/stelace) so you can deploy your own server.

1. Clone this repository

```sh
git clone https://github.com/stelace/marketplace-demo.git
cd marketplace-demo
```

2. Install node_modules

```sh
# using yarn instead of npm is recommended
yarn
```

> If you don’t have [yarn](https://yarnpkg.com/) installed, you can follow these [instructions](https://yarnpkg.com/docs/install).

3. Create environment files for development and production.

You can copy `.env.example` and fill it with Stelace API keys.

```sh
cp .env.example .env.development
# You may want to use live keys in this file
cp .env.example .env.production
```

You need to fill the following environment variables:

- `STELACE_INSTANT_WEBSITE_URL`
- `STELACE_PUBLISHABLE_API_KEY` (*pubk_*...) used in Vue app
- `STELACE_SECRET_API_KEY` (*seck_*...) used in data seeding scripts
- `STELACE_API_URL` can be left blank unless you use your own server rather than default `api.stelace.com`

Please refer to [`.env.example`](./.env.example) for more details about environment variables, including map, payment gateway, logging and analytics.

4. Seed development [data](./docs/development-data.md)

```sh
yarn seed
```

5. Start the development server

```sh
quasar dev
# or, if you want to run Netlify functions with stripe payments as well:
yarn dev
```

Please refer to [Quasar docs](https://quasar.dev/introduction-to-quasar) for more details about front-end configuration and components.

<details>
<summary>Developing with self-hosted Stelace API server (open-source backend).</summary>

Stelace Core API server has to be launched locally before starting this project's server.

First we need to launch services needed by Stelace Core API.

```sh
yarn docker:db
```

Then we need to initialize the database with Instant configuration.

```sh
cd /path/to/stelace-core
git checkout dev
yarn setup:instant
```

Secret and publishable api keys will be displayed so you can use it as environment variables for this project.
You’ll also need to set some environment variables such as `STELACE_API_URL` (http://127.0.0.1:API_PORT).

Let’s start the server.

```sh
yarn dev
```

Please refer to`.env.example` in `stelace-server` project.

</details>

6. Branding

Customize the app with your own colors and branding in `src/styles.json`, documented in [styles.json.md](https://github.com/stelace/marketplace-demo/blob/dev/src/styles.json.md).

## Deployment

We’ve set up continuous deployment for you with Netlify.

You just have to click "_Deploy to netlify_" above and follow the instructions to deploy.

Please refer to [deployment docs section](./docs/deployment.md) for more details or alternatives.
