# Data in development

## Setup

`cp scripts/data-service.example.js scripts/data-service.js`
`cp scripts/data-ecommerce.example.js scripts/data-ecommerce.js`
`cp scripts/data.example.js scripts/data.js`

## Initializing data

We provide the `init-data.js` script to initialize Stelace Core API to ease development with sample data provided in `data-service.js` and `data-ecommerce.js`.

Currently, the script supports the following object types:

- assets
- assetTypes
- customAttributes
- categories
- config
- messages
- ratings
- tasks
- transactions
- users
- workflows

To create an object, you need:

- an identifier that can be used to be referenced in other objects (e.g. the property 'ownerId' for asset)
- the payload that will be used to create the object

To reference the ID of another object, provide a string with the format: '[objectType]::[identifier]' (e.g 'users::employer1' to reference the user created with the key 'employer1').

Note: Transactions cannot be removed via API. Instead transactions are cancelled.

## Local Stelace server

If you need to initialize the platform database with the exact state specified in data.js rather than updating existing resources, please first run `yarn seed` locally to reset database in stelace-server before `yarn seed`.

You may also need to run `yarn seed` in stelace-server when some object structure has changed after data migration or Stelace version upgrade.
