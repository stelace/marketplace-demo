// This file is used to seed database with data exported below,
// using init-data.js script (`yarn seed`).

// Object type keys like 'assetTypes' map to objects to create.
// Corresponding object keys are only used by init-data script to enable references
// where ids are expected, so that you can use 'assetTypes::someName'
// instead of an id you don’t know yet (that will look like 'typ_xx…').

// const ms = require('ms')

// cannot use addToDate from quasar
// because quasar isn't exported as a commonjs module to be used in NodeJS
// function computeDate (isoDate, duration) {
//   return new Date(new Date(isoDate).getTime() + ms(duration)).toISOString()
// }

module.exports = {
  assetTypes: {
    renting: {
      name: 'Renting',
      timeBased: true,
      infiniteStock: false,
      timing: {
        timeUnit: 'd',
        minDuration: { d: 1 }
      },
      active: true
    },
    selling: {
      name: 'Selling',
      timeBased: false,
      infiniteStock: false,
      active: true
    }
  },
  assets: {
    passiveHouse: {
      name: 'Passive House ☀️',
      description: `Rehabilitated to a cosy studio surrounded by nature.
        Equipped with solar panels and saltwater batteries built to last 20 years.
        10 minutes from Aix.
        For sale, please get in touch.
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::house',
      ownerId: 'users::user1',
      price: 120000,
      locations: [
        {
          latitude: 43.54,
          longitude: 5.51,
          shortDisplayName: 'Aix-en-Provence'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        passive: true,
      },
      metadata: {
        images: [
          { name: 'aix-1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/76fe774a40e19a2d56fdfd862b82c814-aix-1.jpg' },
          { name: 'aix-2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/b855f98d62fea4c380d3336cf2169db7-aix-2.jpg' },
          { name: 'aix-3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/03fba6aeda5a0240de8f401879bf5f4a-aix-3.jpg' }
        ]
      }
    },
    charmingFlat: {
      name: 'Flat with unique view',
      description: 'Flat with wonderful vue on the city center and the sea. Perfect for your holidays.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::flat',
      ownerId: 'users::user2',
      price: 50,
      locations: [
        {
          latitude: 43.25,
          longitude: 5.375,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: true
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/b28173dcc77e0a259412bcf30e32ad9e-marseille-1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/c15f255d0d35346eafa9845e78795643-marseille-2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/8b929770769a1e32de7e05080bd45d47-marseille-3.jpg' }
        ]
      }
    },
    cassisFlat: {
      name: 'Flat with panoramic view',
      description: 'Beautiful fully furnished flat with an awesome panoramic view. Perfect for a couple who wants to enjoy a week in Cassis.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::flat',
      ownerId: 'users::user1',
      price: 120,
      locations: [
        {
          latitude: 43.214,
          longitude: 5.536,
          shortDisplayName: 'Cassis'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: true
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/6593ff9acf8efb7fcc25e61fb6967c03-Cassis1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/7a8d6518ee6592b9ea75e5719afa37b5-Cassis2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/779cfe2670ff3efb901ad53d9bcd4d35-Cassis3.jpg' }
        ]
      }
    },
    aixVilla: {
      name: 'Luxurious villa with pool and jacuzzi',
      description: 'Immerse yourself in this luxurious house with summer kitchen and beautiful combination of jacuzzi / pool. The location is just outside Aix. This house guarantees a comfortable stay. On the ground floor of this villa you will find a neat living room with French doors to the garden and a beautiful open kitchen.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::house',
      ownerId: 'users::user2',
      price: 140,
      locations: [
        {
          latitude: 43.598,
          longitude: 5.446,
          shortDisplayName: 'Aix-en-Provence'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/6b829b00e28723f54bf77e6cab0d0979-aixVilla.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/8d501b6e9f6a68c858826d2711eb1c46-aixVilla2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/1fdb2d9c60a3021e6878a93fc4ff5261-aixVilla3.jpg' }
        ]
      }
    },
    gypsyCaravan: {
      name: 'Gorgeous gypsy caravan',
      description: 'Nice gypsy caravan in the middle of nature. Large quiet space, unlimited pool and spa.',
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::house',
      ownerId: 'users::user2',
      price: 15000,
      locations: [
        {
          latitude: 43.174,
          longitude: 5.609,
          shortDisplayName: 'La Ciotat'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/760d88c8f1039f3ad77e523093ff8227-GypsyCaravan.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/d5c2c159cb9777b9a8db1d20f5318b3f-GypsyCaravan2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/22ca5fd18e71ec54c9299ce1727e79bf-GypsyCaravan3.jpg' }
        ]
      }
    },
    cabriesHouse: {
      name: 'New house with a swimming pool',
      description: 'Recent and spacious house, built in 2008 on a large wooded plot of 5500 M2 for 12 people, two or three families.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::house',
      ownerId: 'users::user1',
      price: 115,
      locations: [
        {
          latitude: 43.444,
          longitude: 5.359,
          shortDisplayName: 'Cabriès'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/9b510308034a9a8561d23dc7a165202b-cabriesHouse.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/4e772bdaa583139a8b2a6d130eac32e9-cabriesHouse2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/bae0a885c9ea1744e73660b8fb108133-cabriesHouse3.jpg' }
        ]
      }
    },
    mimetVilla: {
      name: 'Country house with pool and jacuzzi',
      description: 'Villa of architect, typical Provencal country house in the countryside, in the middle of tall pines and oaks. View that overlooks the landscape. Large private pool 12 x 6 meters, plus beach and pleasure garden of 4000 m².',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::house',
      ownerId: 'users::user2',
      price: 115,
      locations: [
        {
          latitude: 43.414,
          longitude: 5.502,
          shortDisplayName: 'Mimet'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: true
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/7f0b6685f43a852ec6d165c5167de265-Mimet.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/a5b6588a15e5a00b2dc8ad23f5f9f959-Mimet2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/a5b6588a15e5a00b2dc8ad23f5f9f959-Mimet2.jpg' }
        ]
      }
    },
    cosyMarseille: {
      name: 'Cozy studio between Old Port and Notre-Dame-de-la-Garde',
      description: 'A quiet 35m² apartment in the heart of one of the most beautiful district of Marseille. The apartment is located 5 minutes walk from the Old Port Notre-Dame de la Garde. Ideal for a weekend, a week of vacation with its beautiful balcony.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::flat',
      ownerId: 'users::user2',
      price: 45,
      locations: [
        {
          latitude: 43.295,
          longitude: 5.364,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/f00937ea4e13abf5549f598d5b698376-cosyMarseille.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/01463da3eb461fd4690bb14676519c7b-cosyMarseille2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/1073f6b5d21096cac91d43fff36be7c9-cosyMarseille3.jpg' }
        ]
      }
    },
    rouetMarseille: {
      name: 'Small flat in Marseille',
      description: 'Small and nice 45m² flat in Marseille. Ideal for a weekend or a week of vacation. Beautiful furnishings: living / dining room with TV (flat screen). 2 rooms, each room with 1 double bed (140 cm). Open kitchen (4 hotplates, dishwasher, electric coffee machine, combination microwave).',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::flat',
      ownerId: 'users::user1',
      price: 75,
      locations: [
        {
          latitude: 43.278,
          longitude: 5.391,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/dbeefb18e2a7e64ebd6c33f9487dfbe4-rouetMarseille.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/172738604141e782a525af06ac9dc3d1-rouetMarseille2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/6881038976d70521bedac26788f203a7-rouetMarseille3.jpg' }
        ]
      }
    },
    brightMarseille: {
      name: 'Bright and charming flat',
      description: 'Charming apartment located in Marseille. The accommodation is in a quiet and pleasant area. Possibility to accommodate 4 people (1 double bed and 1 sofa bed). Wifi, washing machine, oven are also included. Sheets and towels will be provided.',
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::flat',
      ownerId: 'users::user1',
      price: 60,
      locations: [
        {
          latitude: 43.285,
          longitude: 5.382,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/a6438c61933032761bf1539cf1251bf1-brightMarseille.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/807cc6549f26fff45a223dd1e063349d-brightMarseille2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/39d771fa4474de2a218c3742a29e74a2-brightMarseille3.jpg' }
        ]
      }
    },
    niceMarseille: {
      name: 'For sell: Nice apartment in Marseille heart ❤️',
      description: 'Superb apartment very bright and cozy in the heart of Marseille, close to the metro, tram and bus that leads directly to beaches and coves.',
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::flat',
      ownerId: 'users::user1',
      price: 250000,
      locations: [
        {
          latitude: 43.284,
          longitude: 5.383,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/449a049ef5387a87b0a446f549fd47f2-niceMarseille.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/6d7181677943923fcc4c0aab3639199a-niceMarseille2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/5d3a13afad67316ec149bd8878431758-niceMarseille3.jpg' }
        ]
      }
    },
    charmingAix: {
      name: 'Charming flat inside Aix-en-Provence️',
      description: 'This newly renovated apartment is ideally located in the historic center of Aix-en-Provence, just next to the Saint-Sauveur Cathedral and the Hôtel de Ville. Close to all amenities and major tourist sites.',
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::flat',
      ownerId: 'users::user2',
      price: 150000,
      locations: [
        {
          latitude: 43.531,
          longitude: 5.450,
          shortDisplayName: 'Aix-en-Provence'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        scenery: false
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/cc6ef183328ef05383ba4d9ffc92e326-charmingAix.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/1fa226c3b105c1b491381ef070e57227-charmingAix2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238388/test/images/752075b8043a5358b1eae8d15a1d0a27-charmingAix3.jpg' }
        ]
      }
    }
  },
  categories: {
    house: {
      name: 'House'
    },
    flat: {
      name: 'Flat'
    }
  },
  config: {
    default: {
      stelace: {
        instant: {
          serviceName: process.env.VUE_APP_SERVICE_NAME,
          // The following is kept in sync with STELACE_INSTANT_WEBSITE_URL when deploying translations
          // And needed to enable dashboard live content editor
          // platformUrl: 'https://example.com,
          logoUrl: '',
          locale: 'fr',
          currency: 'EUR',
          assetTypes: {
            'assetTypes::renting': {
              customAttributes: [
                'scenery',
              ]
            },
            'assetTypes::selling': {
              customAttributes: [
                'passive',
                'scenery',
              ]
            }
          },
          searchOptions: {
            modes: {
              default: {
                assetTypesIds: ['assetTypes::renting', 'assetTypes::selling'],
                customAttributes: [
                  'passive',
                  'scenery'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              renting: {
                assetTypesIds: ['assetTypes::renting'],
                customAttributes: [
                  'scenery'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              selling: {
                assetTypesIds: ['assetTypes::selling'],
                customAttributes: [
                  'passive',
                  'scenery'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              }
            }
          },
          ratingsOptions: {
            stats: {
              default: {
                labels: ['main'],
                maxScore: 5,
                form: 'star',
                hasComment: true
              }
            },
            types: {
              'main': {
                label: 'main',
                maxScore: 5,
                form: 'star',
                hasComment: true,
              },
            },
            editOrder: [
              'main',
            ],
          },

          assetsInUniqueCountry: 'fr',
          assetsInUniqueCountryActive: true,
          googleAnalyticsTrackingActive: true,
          googleAnalyticsTrackingId: 'UA-XXXXXX-1', // for development

          twitterUsername: 'StelaceAPI',
          // facebookUrl: ''
        }
      }
    }
  },
  customAttributes: {
    passive: {
      name: 'passive',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.passive_label',
              default: 'Passive House' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          materialIcon: 'wb_sunny', // example of UI customization with metadata
          priority: 10 // used to order custom attributes in UI
        }
      }
    },
    scenery: {
      name: 'scenery',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.scenery_label',
              default: 'Breathtaking Scenery'
            },
            description: {}
          },
          materialIcon: 'insert_photo', // example of UI customization with metadata
          priority: 20 // used to order custom attributes in UI
        }
      }
    }
  },
  messages: {

  },
  ratings: {

  },
  transactions: {

  },
  users: {
    user1: {
      username: `marketplace-test-user1@example.com`,
      password: `marketplace-test-user1@example.com`,
      email: `marketplace-test-user1@example.com`,
      displayName: 'Jeanne',
      firstname: 'Jeanne',
      lastname: 'D.',
      metadata: {
        _private: {
          phone: '+33 9 87 65 43 21',
        },

        instant: {
          avatarUrl: 'https://stelace-instant-files.s3.eu-central-1.amazonaws.com/p/238380/live/images/b857b499cb5da04af538d320ae6c28cc-Jeanne.png'
        }
      }
    },
    user2: {
      username: `marketplace-test-user2@example.com`,
      password: `marketplace-test-user2@example.com`,
      email: `marketplace-test-user2@example.com`,
      displayName: 'Richard',
      firstname: 'Richard',
      lastname: 'R.',
      metadata: {
        _private: {
          phone: '+33 6 87 65 43 21',
        },

        instant: {
          avatarUrl: 'https://stelace-instant-files.s3.eu-central-1.amazonaws.com/p/238380/live/images/4d188e4b6ce42fe5d460372a3d6f3a1d-Richard.png'
        }
      }
    },
    user3: {
      username: `marketplace-test-user3@example.com`,
      password: `marketplace-test-user3@example.com`,
      email: `marketplace-test-user3@example.com`,
      displayName: 'Cyril',
      firstname: 'Cyril',
      lastname: 'Petit',
      metadata: {
        instant: {
          avatarUrl: ''
        }
      }
    }
  },
  /* eslint-disable no-template-curly-in-string */
  // '`${computed.var}`' template strings can be used in plain strings in Workflows,
  // and will be evaluated during run.
  // Please note that backticks ` are not needed in endpointUri nor in endpointHeaders,
  // where only strings are expected and parsed as template strings anyway.

  // You can also use Workflow contexts for easier maintenance with env variables: ${env.SOME_VAR}
  // Please refer to the Docs for more info: https://stelace.com/docs/command/workflows
  workflows: {
    getEmailCheckTokenAtRegistration: {
      name: '[Check] Email check token at user registration',
      description: 'When a user is created, create an email token that will be used to validate the new user email',
      event: 'user__created',
      context: ['stelace'],
      computed: {
        expirationDate: 'new Date(new Date().getTime() + 3600 * 1000).toISOString()'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: `!user.email`,
          endpointUri: '/token/check/request',
          endpointPayload: {
            userId: 'user.id',
            type: '"email"',
            expirationDate: 'computed.expirationDate',
            redirectUrl: '`${env.STELACE_INSTANT_WEBSITE_URL}?check=email`',
            data: {
              registration: true
            }
          }
        }
      ]
    },
    getEmailCheckTokenFromRequest: {
      name: '[Check] Email check token for email validation',
      description: 'The check token will be used to validate an email that is filled by user',
      event: 'email_check_request',
      context: ['stelace'],
      computed: {
        userId: 'objectId',
        expirationDate: 'new Date(new Date().getTime() + 3600 * 1000).toISOString()',
        toEmail: 'metadata.email'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!computed.userId || !computed.toEmail',
          endpointUri: '/token/check/request',
          endpointPayload: {
            userId: 'computed.userId',
            type: '"email"',
            expirationDate: 'computed.expirationDate',
            redirectUrl: '`${env.STELACE_INSTANT_WEBSITE_URL}?check=email`',
            data: {
              email: 'computed.toEmail',
              replaceEmail: true
            }
          }
        }
      ]
    },
    sendEmailCheckOrAtRegistration: {
      name: '[Email] Email validation link',
      description: `
        Send an email with an link that validates the user email.
        It is used for user registration or when the user changes her email.
      `,
      event: 'token__check_requested',
      context: ['stelace'],
      computed: {
        toName: 'user.displayName',
        tokenEmail: '_.get(metadata, "data.email")',
        isRegistration: '_.get(metadata, "data.registration", false)',
        emailCheckLink: '`${env.STELACE_API_URL || "https://api.stelace.com"}/token/check/${metadata.token}?redirect=true`'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!user.email && !computed.tokenEmail',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: 'computed.isRegistration ? "registration" : "emailCheck"',
            data: {
              emailCheckLink: 'computed.emailCheckLink'
            },
            locale: '"fr"',
            toEmail: 'computed.isRegistration ? user.email : computed.tokenEmail',
            toName: 'computed.toName'
          }
        }
      ]
    },
    verifyEmail: {
      name: '[Update] Email verified',
      description: 'The email check token is validated. Set the user email to verified.',
      event: 'token__check_confirmed',
      computed: {
        userId: 'user.id',
        email: '_.get(metadata, "data.email")',
        replaceEmail: '_.get(metadata, "data.replaceEmail")'
      },
      run: [
        {
          endpointMethod: 'PATCH',
          endpointUri: '/users/${computed.userId}',
          endpointPayload: {
            email: 'computed.replaceEmail && computed.email ? computed.email : undefined', // do not update email
            platformData: {
              _private: {
                newEmail: 'computed.replaceEmail && computed.email ? null : undefined' // do not update if no replace
              },
              instant: {
                emailVerified: true
              }
            }
          }
        }
      ]
    },

    sendEmailPasswordReset: {
      name: '[Email] Password reset',
      description: 'Get the email and send the reset password to it',
      event: 'password__reset_requested',
      context: ['stelace'],
      computed: {
        toName: 'user.displayName',
        toEmail: 'user.email',
        passwordResetLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/?reset-password=${metadata.resetToken}`'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!computed.toEmail',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"passwordReset"',
            data: {
              passwordResetLink: 'computed.passwordResetLink'
            },
            locale: '"fr"',
            toEmail: 'computed.toEmail',
            toName: 'computed.toName'
          }
        }
      ]
    },

    sendEmailToTakerWhenTransactionStatusChanged: {
      name: '[Email] Transaction update to taker',
      description: 'Send an email to taker when a transaction is accepted or refused by owner',
      event: 'transaction__status_changed',
      computed: {
        // fallback to empty strings for email content
        organizationName: 'owner.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'taker.displayName || ""',
        toEmail: 'taker.email'
      },
      run: [
        {
          name: 'acceptedByOwnerEmail',
          endpointMethod: 'POST',
          stop: '!computed.toEmail',
          skip: 'transaction.status !== "accepted"',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionAcceptedByOwnerToTaker"',
            data: {
              assetName: 'computed.assetName',
              organizationName: 'computed.organizationName'
            },
            locale: '"fr"',
            toEmail: 'computed.toEmail',
            toName: 'computed.toName'
          }
        },
        {
          name: 'refusedByOwnerEmail',
          endpointMethod: 'POST',
          skip: `
            transaction.status !== "cancelled" ||
            transaction.cancellationReason !== "refusedByOwner"
          `,
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionRefusedByOwnerToTaker"',
            data: {
              organizationName: 'computed.organizationName',
              assetName: 'computed.assetName'
            },
            locale: '"fr"',
            toEmail: 'computed.toEmail',
            toName: 'computed.toName'
          }
        }
      ]
    },

    sendEmailToOwnerWhenTransactionStatusChanged: {
      name: '[Email] Transaction update to owner',
      description: 'Send email to owner when transaction is accepted or refused by taker',
      event: 'transaction__status_changed',
      context: ['stelace'],
      computed: {
        // fallback to empty strings for email content
        transactionId: 'transaction.id',
        takerDisplayName: 'taker.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'owner.displayName || ""',
        toEmail: 'owner.email'
      },
      run: [
        // accepted
        {
          name: 'acceptedByTakerEmail',
          endpointMethod: 'POST',
          stop: '!computed.toEmail',
          skip: 'transaction.status !== "validated"',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionAcceptedByTakerToOwner"',
            data: {
              takerDisplayName: 'computed.takerDisplayName',
              assetName: 'computed.assetName'
            },
            locale: '"fr"',
            toEmail: 'computed.toEmail',
            toName: 'computed.toName'
          }
        },
        // refused
        {
          name: 'messages',
          stop: `
            transaction.status !== "cancelled" ||
            !["refusedByTaker", "withdrawn"].includes(transaction.cancellationReason)
          `,
          endpointMethod: 'GET',
          endpointUri: '/messages?topicId=${computed.transactionId}',
        },
        {
          name: 'refusedByTakerEmail',
          stop: '!responses.messages.results.length',
          endpointMethod: 'POST',
          computed: {
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${responses.messages.results[0].conversationId}`'
          },
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionRefusedByTakerToOwner"',
            data: {
              takerDisplayName: 'computed.takerDisplayName',
              assetName: 'computed.assetName',
              conversationLink: 'computed.conversationLink'
            },
            locale: '"fr"',
            toEmail: 'computed.toEmail',
            toName: 'computed.toName'
          }
        }
      ]
    },

    sendNotificationWhenNewMessage: {
      name: 'New message notification',
      description: 'Send a notification via Signal',
      event: 'message__created',
      context: ['stelace'],
      computed: {
        messageId: 'S.get("message", "id")',
        receiverId: 'S.get("message", "receiverId")',
      },
      run: [
        {
          stop: '!computed.receiverId',
          endpointMethod: 'POST',
          endpointUri: '/signal',
          endpointPayload: {
            message: {
              id: 'computed.messageId',
            },
            destination: 'computed.receiverId',
            event: '"newMessage"'
          }
        }
      ]
    },

    completeTransactions: {
      name: 'Complete transactions',
      description: `
        Trigger completion transition of validated transactions.
        Completed transactions won't block assets removal.
      `,
      event: 'transaction__status_changed',
      run: [
        {
          endpointMethod: 'POST',
          stop: `transaction.status !== "validated"`,
          endpointUri: '/transactions/${transaction.id}/transitions',
          endpointPayload: {
            name: '"complete"'
          }
        }
      ]
    },
  }
  /* eslint-enable no-template-curly-in-string */
}
