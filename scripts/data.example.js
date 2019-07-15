// This file is used to seed database with data exported below,
// using init-data.js script.

// Object type keys like 'assetTypes' map to objects to create.
// Corresponding object keys are only used by init-data script to enable references
// like where ids are expected, so that you can use 'assetTypes::someName'
// instead of an id you don’t know (that will look like 'ast_xx…').

const ms = require('ms')

// cannot use addToDate from quasar
// because quasar isn't exported as a commonjs module to be used in NodeJS
function computeDate (isoDate, duration) {
  return new Date(new Date(isoDate).getTime() + ms(duration)).toISOString()
}

module.exports = {
  assetTypes: {
    job: {
      name: 'Job',
      timeBased: true,
      infiniteStock: false,
      timing: {
        timeUnit: 'M',
        minDuration: { d: 1 }
      },
      active: true
    },
    applicant: {
      name: 'Applicant',
      timeBased: true,
      infiniteStock: false,
      timing: {
        timeUnit: 'M',
        minDuration: { d: 1 }
      },
      active: true
    }
  },
  assets: {
    barman: {
      name: 'Awesome barman',
      description: 'Barman description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company1',
      price: 2000,
      locations: [
        {
          latitude: 44.5667,
          longitude: 6.0833,
          shortDisplayName: 'Gap'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        fed: true,
        lodged: true,
      },
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/6b5bca6e96d095228fd070ffade9f4c5-IMG_0044.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/94b61699afbdfdb249c69d58d50b65fa-IMG_0088.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/fe30b4130841a5df3b286b827c6ec715-IMG_0066.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/f89bd281daf4d3f3d586ba1448693c86-IMG_0120.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/69fc77bfd7b6edf19828e1c9d69b817e-IMG_0170.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/db36c7b812ab5c752541d65a554f861f-IMG_0213.JPG' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/516ce7283219eea9a9929cd885b05fe9-IMG_0197.JPG' }
        ]
      }
    },
    waiter: {
      name: 'Oyster farm worker',
      description: 'Hard work, very rewarding',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company2',
      price: 2500,
      locations: [
        {
          latitude: 43.7031,
          longitude: 7.2661,
          shortDisplayName: 'Oléron'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        fed: true,
      },
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/37417d8fdee7f756889e9251f696b159-Juste-4.jpg' }
        ]
      }
    },
    farmWorker1: {
      name: 'Experienced Farm Worker for Summer',
      description: 'Farm Worker description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company3',
      price: 1800,
      locations: [
        {
          latitude: 43.6,
          longitude: 3.8833,
          shortDisplayName: 'Montpellier'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/2bedecf2e22bebb4b78d8bf656139afa-ClanMaMa-1.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/db235d3732d7d21bd012d889a364c36e-ClanMaMa-2.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/c13f4981551c3f2471fd06dba8c27b9d-ClanMaMa-3.jpg' }
        ]
      }
    },
    farmWorker2: {
      name: 'Experienced Farm Worker for Spring',
      description: 'Farm Worker description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company3',
      price: 1800,
      locations: [
        {
          latitude: 43.6,
          longitude: 3.8833,
          shortDisplayName: 'Montpellier'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/4c542ffebd490cfc73373a754bd144d8-Belvedere1.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/07bbb8c7fe7b5ca5e13f5668124a9c47-Belvedere2.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/7d1afc8b6ae1ee97e3ea1774ecd97604-Belvedere3.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/7ca02f3f0ba85ca344e4dc0b4d76f8f1-Belvedere4.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/0b888640db8d6245b792ca2c38e4ad6e-Belvedere5.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/a77ec5be0cea668dfbd6ca0104d1fa7e-Belvedere6.jpg' }
        ],
      }
    },
    tourGuide: {
      name: 'Beginner tour guide',
      description: 'Tour guide description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company3',
      price: 1000,
      locations: [
        {
          latitude: 43.2961,
          longitude: 5.3699,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/819117a2ebcb1843770df00a6d62fc43-42840329_267734193795979_8786764997486182400_o.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/3d3794bbf0591a70b67d8724898d7410-31649378_186219878614078_6013957557415051264_n.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/e7d6b98b0be913b09a9c8dc81f10beb0-48123040_292455064657225_7619080182749462528_o.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/f5c9218d019d262f3d15295596b09551-48366346_290948278141237_4912170395836088320_o.jpg' },
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/77d9be123efa469932ab2454fb9f95eb-53632226_324173318152066_6784837503384813568_o.jpg' }
        ]
      }
    },
    tourGuide2: {
      name: 'Tour guide for insolite places',
      description: 'Tour guide description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company3',
      price: 2500,
      locations: [
        {
          latitude: 43.2961,
          longitude: 5.3699,
          shortDisplayName: 'Marseille'
        }
      ],
      validated: true,
      active: true,
      metadata: {
      }
    },
    photographer: {
      name: 'Confirmed photographer',
      description: 'Expert needed',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company4',
      price: 2700,
      locations: [
        {
          latitude: 48.3905,
          longitude: -4.4860,
          shortDisplayName: 'Brest'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/f5c9218d019d262f3d15295596b09551-48366346_290948278141237_4912170395836088320_o.jpg' }
        ]
      }
    },
    gardener: {
      name: 'Specialized gardener',
      description: 'Tulip expert',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company2',
      price: 4100,
      locations: [
        {
          latitude: 48.5846,
          longitude: 7.7507,
          shortDisplayName: 'Strasbourg'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/48ea4fe7281ea6e2c3b732cb3455d9fc-japanese-gardens.jpg' }
        ]
      }
    },
    iceCreamVendor: {
      name: 'Beach ice cream vendor',
      description: 'Ice cream vendor description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company1',
      price: 2300,
      locations: [
        {
          latitude: 50.6305,
          longitude: 3.0706,
          shortDisplayName: 'Lille'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        fed: true,
        lodged: false,
        laundry: true
      },
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/69fc77bfd7b6edf19828e1c9d69b817e-IMG_0170.JPG' }
        ]
      }
    },
    ballBoy: {
      name: 'Ball boy for Rolland Garros',
      description: 'Ball boy description',
      assetTypeId: 'assetTypes::job',
      ownerId: 'users.mainOrganization::company4',
      price: 1100,
      locations: [
        {
          latitude: 48.8566,
          longitude: 2.3514,
          shortDisplayName: 'Paris'
        }
      ],
      validated: true,
      active: true,
      metadata: {
        images: [
          { url: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/b641d42803ac2dee7dbc3112a70e0e68-roland-garros.jpg' }
        ]
      }
    }
  },
  categories: {
    farmWorker: {
      name: 'Farm Worker'
    },
    waiter: {
      name: 'Waiter'
    },
    photographer: {
      name: 'Photographer'
    },
    barman: {
      name: 'Barman'
    }
  },
  config: {
    default: {
      stelace: {
        instant: {
          serviceName: process.env.VUE_APP_SERVICE_NAME,
          logoUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/a5b21e6f26dd2340dd7fc34529972db9-logo-email.png',
          locale: 'fr',
          currency: 'EUR',
          assetTypes: {
            'assetTypes::job': {
              isDefault: true,
              customAttributes: [
                'fed',
                'lodged',
                'laundry'
              ]
            }
          },
          searchOptions: {
            modes: {
              default: {
                assetTypesIds: ['assetTypes::job'],
                customAttributes: [
                  'fed',
                  'lodged',
                  'laundry'
                ],
                isActiveFor: [
                  'public',
                  'user',
                  'provider'
                ]
              },
              reversed: {
                assetTypesIds: ['assetTypes::applicant'],
                isActiveFor: ['getters.isPremium'],
                isDefaultFor: ['getters.isPremium']
              }
            }
          },
          ratingsOptions: {
            stats: {
              default: {
                labels: ['main:*'],
                maxScore: 5,
                form: 'star',
              },
              completionScore: {
                labels: ['completionScore'],
                maxScore: 100,
                form: 'slider',
              },
              recommendation: {
                labels: ['recommendation'],
                maxScore: 100,
                form: 'boolean',
              }
            },
            types: {
              'main:presentation': {
                label: 'main:presentation',
                maxScore: 5,
                form: 'star',
              },
              'main:punctuality': {
                label: 'main:punctuality',
                maxScore: 5,
                form: 'star',
              },
              'main:consistency': {
                label: 'main:consistency',
                maxScore: 5,
                form: 'star',
              },
              'main:teamSpirit': {
                label: 'main:teamSpirit',
                maxScore: 5,
                form: 'star',
              },
              'main:involvement': {
                label: 'main:involvement',
                maxScore: 5,
                form: 'star',
              },
              'completionScore': {
                label: 'completionScore',
                form: 'boolean',
              },
              'recommendation': {
                label: 'recommendation',
                form: 'boolean',
                choices: [
                  { value: true, score: 100 }
                ],
              }
            },
            editOrder: [
              'main:presentation',
              'main:punctuality',
              'main:consistency',
              'main:teamSpirit',
              'main:involvement',
              'completionScore',
              'recommendation',
            ],
          },
          assetsInUniqueCountry: 'fr',
          assetsInUniqueCountryActive: true,
          shouldAuthenticateAsOrg: ['provider'],
          countriesCovered: ['fr'],
          countriesCoveredActive: true,
          googleAnalyticsTrackingActive: true,
          googleAnalyticsTrackingId: 'UA-XXXXXX-1', // for development
          facebookUrl: 'https://www.facebook.com/GunsGermsAndSteel/'
        }
      }
    }
  },
  customAttributes: {
    fed: {
      name: 'fed',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.fed_label',
              default: 'Fed' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          materialIcon: 'restaurant', // example of UIcustomization with metadata
          priority: 10 // used to order custom attributes in UI
        }
      }
    },
    lodged: {
      name: 'lodged',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.lodged_label',
              default: 'Lodged'
            },
            description: {}
          },
          materialIcon: 'home',
          priority: 5 // used to order custom attributes in UI
        }
      }
    },
    laundry: {
      name: 'laundry',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.laundry_label',
              default: 'Laundry'
            },
            description: {}
          },
          materialIcon: 'local_laundry_service',
          priority: 1 // used to order custom attributes in UI
        }
      }
    },
    reference: {
      name: 'reference',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.reference_label',
              default: 'Reference'
            },
            description: {}
          },
          materialIcon: null,
          priority: 1 // used to order custom attributes in UI
        }
      }
    }
  },
  messages: {
    message1: {
      topicId: 'transactions::waiter',
      content: 'Hi',
      read: true,
      senderId: 'users::applicant1',
      receiverId: 'users::company2'
    },
    message2: {
      topicId: 'transactions::waiter',
      content: 'I’d like to know more.',
      conversationId: 'conversations::message1',
      read: true,
      senderId: 'users::company2',
      receiverId: 'users::applicant1'
    },
    message3: {
      topicId: 'transactions::waiter',
      content: 'Did you receive my message?',
      conversationId: 'conversations::message1',
      read: false,
      senderId: 'users::company2',
      receiverId: 'users::applicant1'
    },
    message4: {
      topicId: 'transactions::farmWorker1',
      content: 'This is a game I’m testing.',
      read: true,
      senderId: 'users::applicant2',
      receiverId: 'users::company3'
    }
  },
  ratings: {
    applicant1Presentation: {
      score: 70,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'main:presentation'
    },
    applicant1Punctuality: {
      score: 30,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'main:punctuality'
    },
    applicant1Consistency: {
      score: 80,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'main:consistency'
    },
    applicant1TeamSpirit: {
      score: 100,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'main:teamSpirit'
    },
    applicant1Involvement: {
      score: 50,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'main:involvement'
    },
    applicant1CompletionScore: {
      score: 0,
      authorId: 'users::company1',
      targetId: 'users::applicant1',
      transactionId: 'transactions::waiter',
      label: 'completionScore'
    },
  },
  transactions: {
    waiter: {
      assetId: 'assets::waiter',
      startDate: computeDate(new Date().toISOString(), '10d'),
      duration: { d: 30 },
      quantity: 1,
      takerId: 'users::applicant1'
    },
    farmWorker1: {
      assetId: 'assets::farmWorker1',
      startDate: computeDate(new Date().toISOString(), '5d'),
      duration: { d: 15 },
      quantity: 1,
      takerId: 'users::applicant2'
    },
    barman: {
      assetId: 'assets::barman',
      startDate: computeDate(new Date().toISOString(), '15d'),
      duration: { d: 10 },
      quantity: 1,
      takerId: 'users::applicant2'
    }
  },
  users: {
    company1: {
      username: `jobs-marketplace-test-premium1@example.com`,
      password: 'jobs-marketplace-test-premium1@example.com',
      email: 'jobs-marketplace-test-premium1@example.com',
      displayName: 'Company 1',
      roles: ['provider', 'premium'],
      metadata: {
        _private: {
          taxId: 'FRAB123456789',
          phone: '+33 1 23 45 67 89',
        },
        instant: {
          twitterHandle: '@company1'
        }
      },
      platformData: {
        instant: {
          emailVerified: true,
          phoneVerified: true,
          taxIdVerified: true,
          accountActive: true,
        },

        _private: {
          validTaxIds: ['FRAB123456789'],
          premiumEndDate: computeDate(new Date().toISOString(), '30d')
        }
      }
    },
    company2: {
      username: `jobs-marketplace-test-recruteur2@example.com`,
      password: 'jobs-marketplace-test-recruteur2@example.com',
      email: `jobs-marketplace-test-recruteur2@example.com`,
      displayName: 'Company 2',
      roles: ['provider'],
      metadata: {
        instant: {
          twitterHandle: '@company2'
        },
      }
    },
    company3: {
      username: `jobs-marketplace-test-recruteur3@example.com`,
      password: 'jobs-marketplace-test-recruteur3@example.com',
      email: 'jobs-marketplace-test-recruteur3@example.com',
      displayName: 'Company 3',
      roles: ['provider'],
      metadata: {
        instant: {
          twitterHandle: '@company2'
        },
      }
    },
    company4: {
      username: `jobs-marketplace-test-recruteur4@example.com`,
      password: 'jobs-marketplace-test-recruteur4@example.com',
      email: 'jobs-marketplace-test-recruteur4@example.com',
      displayName: 'Company 4',
      roles: ['provider'],
      metadata: {
        instant: {
          twitterHandle: '@company4'
        },
      }
    },
    applicant1: {
      username: `jobs-marketplace-test-candidat1@example.com`,
      password: `jobs-marketplace-test-candidat1@example.com`,
      email: `jobs-marketplace-test-candidat1@example.com`,
      displayName: 'Jordan',
      firstname: 'Jordan',
      lastname: 'Rossignol',
      roles: ['user'],
      metadata: {
        _private: {
          phone: '+33 9 87 65 43 21',
        },

        instant: {
          profileTitle: 'Best barman in town',
          profileSalary: 2000,
          categoryId: 'categories::barman',
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/2abc4416b56dfe144e1e2c43d3143bee-Profil-Jordan-003.jpg'
        }
      },
      platformData: {
        instant: {
          emailVerified: true,
          phoneVerified: true,
          accountActive: true
        }
      }
    },
    applicant2: {
      username: `jobs-marketplace-test-candidat2@example.com`,
      password: `jobs-marketplace-test-candidat2@example.com`,
      email: `jobs-marketplace-test-candidat2@example.com`,
      displayName: 'Sophie',
      firstname: 'Sophie',
      lastname: 'Bleue',
      roles: ['user'],
      metadata: {
        _private: {
          phone: '+33 6 87 65 43 21',
        },

        instant: {
          profileTitle: 'Skilled photographer',
          profileSalary: 1500,
          categoryId: 'categories::photographer',
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/4060e81d8687239763932b4e59a140d0-132x132_usr_avatar_maman_louve.jpg'
        }
      },
      platformData: {
        instant: {
          emailVerified: true,
          phoneVerified: true,
          accountActive: true
        }
      }
    },
    applicant3: {
      username: `jobs-marketplace-test-candidat3@example.com`,
      password: `jobs-marketplace-test-candidat3@example.com`,
      email: `jobs-marketplace-test-candidat3@example.com`,
      displayName: 'Cyril',
      firstname: 'Cyril',
      lastname: 'Petit',
      roles: ['user'],
      metadata: {
        _private: {
          phone: '+33 2 68 65 23 21',
        },

        instant: {
          profileTitle: 'Trained farm worker',
          profileSalary: 1350,
          categoryId: 'categories::farmWorker',
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/833a41bdc057376c6954800b12157219-image-principale-919b9d.png'
        }
      },
      platformData: {
        instant: {
          emailVerified: true,
          phoneVerified: true,
          accountActive: true
        }
      }
    }
  },
  /* eslint-disable no-template-curly-in-string */
  // '`${computed.var}`' template strings can be used in plain strings in Workflows,
  // and will be evaluated during run.
  // Please note that backticks ` are not needed in endpointUri nor in endpointHeaders,
  // where only strings are expected and parsed as template strings anyway.

  // You can also use Workflow contexts for easier maintenance. Please refer to API reference.
  workflows: {
    getEmailCheckTokenAtRegistration: {
      name: '[Check] Email check token at user registration',
      description: 'When a user is created, create an email token that will be used to validate the new user email',
      event: 'user__created',
      context: ['stelace'],
      computed: {
        expirationDate: 'new Date(new Date().getTime() + 3600 * 1000).toISOString()',
        isProvider: 'user.roles.some(role => role === "provider")',
        isOrganization: 'user.roles.some(role => role === "organization")'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: `
            !user.email ||
            (
              computed.isProvider &&
              !(computed.isProvider && computed.isOrganization)
            )
          `,
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

    startPhoneNumberVerification: {
      name: '[Check] Phone number',
      description: 'Get the user phone, submit it for verification and send the requestId back for the next step',
      event: 'phoneValidation_start',
      context: ['nexmo'],
      computed: {
        userId: 'objectId',
        phone: 'metadata.phone',
        signalId: 'metadata.signalId',
        nexmoCredentials: 'Boolean(env.NEXMO_API_KEY && env.NEXMO_API_SECRET)'
      },
      run: [
        {
          description: 'Update user with the new phone number',
          endpointMethod: 'PATCH',
          stop: '!computed.userId || !computed.phone || !computed.signalId',
          endpointUri: '/users/${computed.userId}',
          endpointPayload: {
            platformData: {
              _private: {
                newPhone: 'computed.phone'
              }
            }
          }
        },
        {
          name: 'verification',
          description: 'Send verify request to Nexmo',
          endpointMethod: 'POST',
          stop: '!computed.phone || !computed.nexmoCredentials',
          endpointUri: 'https://api.nexmo.com/verify/json',
          endpointPayload: {
            api_key: 'env.NEXMO_API_KEY',
            api_secret: 'env.NEXMO_API_SECRET',
            number: 'computed.phone',
            brand: `"${process.env.VUE_APP_SERVICE_NAME}"`, // hard-coded in Workflow
            pin_expiry: 600
          }
        },
        {
          description: 'Create a request code signal event',
          endpointMethod: 'POST',
          endpointUri: '/signal',
          endpointPayload: {
            message: {
              requestId: 'responses.verification.request_id',
              phone: 'computed.phone',
              success: 'responses.verification.status === "0"'
            },
            destination: 'computed.signalId',
            event: '"phoneValidation_requestCode"'
          }
        }
      ]
    },
    checkPhoneNumber: {
      name: '[Update] Phone verified',
      description: `
        The user has submitted the requestId and the phone verification code.
        Check it with Nexmo, return the result.
        Set the phone to verified if appropriate.
        Note that the check is faked when Nexmo API key and secret are not set in Workflow context.
      `,
      event: 'phoneValidation_checkCode',
      context: ['nexmo'],
      computed: {
        userId: 'objectId',
        requestId: 'metadata.requestId',
        code: 'metadata.code',
        signalId: 'metadata.signalId',
        nexmoCredentials: 'Boolean(env.NEXMO_API_KEY && env.NEXMO_API_SECRET)'
      },
      run: [
        {
          name: 'nexmoCheck',
          description: 'Send verify check to Nexmo',
          stop: `
            !computed.userId ||
            !computed.requestId ||
            !computed.code ||
            !computed.signalId ||
            !computed.newPhone
          `,
          skip: '!computed.nexmoCredentials',
          endpointMethod: 'POST',
          computed: {
            newPhone: '_.get(user, "platformData._private.newPhone")', // user comes from objectId
          },
          endpointUri: 'https://api.nexmo.com/verify/check/json',
          endpointPayload: {
            api_key: 'env.NEXMO_API_KEY',
            api_secret: 'env.NEXMO_API_SECRET',
            request_id: 'computed.requestId',
            code: 'computed.code',
          }
        },
        {
          description: 'Update user if success',
          endpointMethod: 'PATCH',
          computed: {
            success: '!computed.nexmoCredentials || responses.nexmoCheck.status === "0"'
          },
          skip: '!computed.success',
          endpointUri: '/users/${computed.userId}',
          endpointPayload: {
            metadata: {
              _private: {
                phone: 'computed.newPhone',
              }
            },
            platformData: {
              instant: {
                phoneVerified: 'true',
              },
              _private: {
                newPhone: 'null'
              }
            }
          }
        },
        {
          description: 'Create validation result event',
          endpointMethod: 'POST',
          endpointUri: '/signal',
          computed: {
            wrongCode: 'responses.nexmoCheck.status === "16"'
          },
          endpointPayload: {
            message: {
              requestId: 'computed.requestId',
              success: 'computed.success',
              wrongCode: 'computed.wrongCode'
            },
            destination: 'computed.signalId',
            event: '"phoneValidation_result"'
          }
        }
      ]
    },

    checkTaxId: {
      name: '[Check] Tax ID',
      description: `
        Get the user tax ID, submit it to VatSense for verification and send the result back.
        If the tax ID is valid, store it so the server-side knows it's valid.
      `,
      event: 'taxIdValidation_request',
      context: ['vatsense'],
      computed: {
        taxId: 'metadata.taxId',
        signalId: 'metadata.signalId',
        userId: 'objectId'
      },
      run: [
        {
          name: 'taxId',
          description: 'Check Tax ID via VatSense API',
          endpointMethod: 'GET',
          computed: {
            // Node.js base64 encode
            basicAuthValue: 'Buffer.from(`user:${env.VATSENSE_API_KEY}`).toString("base64")',
          },
          stop: `
            !computed.taxId ||
            !computed.signalId ||
            !computed.userId
          `,
          endpointUri: 'https://api.vatsense.com/1.0/validate?vat_number=${computed.taxId}',
          endpointHeaders: {
            authorization: 'Basic ${computed.basicAuthValue}'
          }
        },
        {
          description: 'If the tax ID is valid then save it into user, unless it is already stored',
          endpointMethod: 'PATCH',
          endpointUri: '/users/${computed.userId}',
          computed: {
            validTaxIds: '_.get(user, "platformData._private.validTaxIds", [])', // user comes from objectId
            success: '_.get(responses, "taxId.success")',
          },
          skip: '!computed.success || computed.validTaxIds.includes(computed.taxId)',
          endpointPayload: {
            platformData: {
              _private: {
                validTaxIds: 'computed.validTaxIds.concat([computed.taxId])'
              }
            }
          }
        },
        {
          computed: {
            getTaxIdData: 'key => _.get(responses, `taxId.data.${key}`)'
          },
          endpointMethod: 'POST',
          endpointUri: '/signal',
          endpointPayload: {
            message: {
              taxId: 'computed.taxId',
              countryCode: 'computed.getTaxIdData("company.country_code")',
              companyName: 'computed.getTaxIdData("company.country_name")',
              companyAddress: 'computed.getTaxIdData("company.company_address")',
              vatNumber: 'computed.getTaxIdData("company.vat_number")',
              success: 'computed.success'
            },
            destination: 'computed.signalId',
            event: '"taxIdValidation_result"'
          }
        }
      ]
    },

    updateUserTaxIdVerified: {
      name: '[Update] User Tax ID verified',
      description: 'If the user updates her tax ID and it’s in the verified list, set the tax ID as verified',
      event: 'user__updated',
      computed: {
        validTaxIds: '_.get(user, "platformData._private.validTaxIds", [])',
        taxId: '_.get(user, "metadata._private.taxId")',
        taxIdVerified: '_.get(user, "platformData.instant.taxIdVerified")',
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: `
            (!computed.taxIdVerified || computed.validTaxIds.includes(computed.taxId)) &&
            (computed.taxIdVerified || !computed.validTaxIds.includes(computed.taxId))
          `,
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            platformData: {
              instant: {
                taxIdVerified: 'computed.validTaxIds.includes(computed.taxId)'
              }
            }
          }
        },
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

    sendEmailToTakerWhenTransactionAcceptedByOwner: {
      name: '[Email] Accepted transaction to taker',
      description: 'Send an email to taker when a transaction is accepted by owner',
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
          endpointMethod: 'POST',
          stop: `
            !computed.toEmail ||
            transaction.status !== "accepted"
          `,
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
        }
      ]
    },

    sendEmailToTakerWhenTransactionRefusedByOwner: {
      name: '[Email] Refused transaction to taker',
      description: 'Send email to taker when transaction is refused by owner',
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
          endpointMethod: 'POST',
          stop: `
            !computed.toEmail ||
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

    sendEmailToOwnerWhenTransactionAcceptedByTaker: {
      name: '[Email] Accepted transaction to owner',
      description: 'Send email to owner when transaction is accepted by taker',
      event: 'transaction__status_changed',
      computed: {
        // fallback to empty strings for email content
        takerDisplayName: 'taker.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'owner.displayName || ""',
        toEmail: 'owner.email'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!computed.toEmail || transaction.status !== "validated"',
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
        }
      ]
    },

    sendEmailToOwnerWhenTransactionRefusedByTaker: {
      name: '[Email] Refused transaction to owner',
      description: 'Send email to owner when transaction is refused by taker',
      event: 'transaction__status_changed',
      context: ['stelace'],
      computed: {
        // fallback to empty strings for email content
        transactionId: 'transaction.id',
        takerDisplayName: 'taker.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'taker.displayName || ""',
        toEmail: 'taker.email'
      },
      run: [
        {
          name: 'messages',
          stop: `
            !computed.toEmail ||
            transaction.status !== "cancelled" ||
            !["refusedByTaker", "withdrawn"].includes(transaction.cancellationReason)
          `,
          endpointMethod: 'GET',
          endpointUri: '/messages?topicId=${computed.transactionId}',
        },
        {
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

    sendEmailToTakerWhenProviderContact: {
      name: '[Email] Provider contacts a user',
      description: 'Send an email when a provider contacts a user if it’s the first message of the conversation',
      event: 'message__created',
      context: ['stelace'],
      computed: {
        firstNotification: '_.get(message, "metadata.instant.firstNotification", false)',
        senderType: '_.get(message, "metadata.instant.senderType")',
        conversationId: 'message.conversationId',
        receiverId: 'message.receiverId'
      },
      run: [
        {
          name: 'receiver',
          stop: `
            !computed.conversationId &&
            !computed.firstNotification &&
            computed.senderType !== "provider"
          `,
          endpointMethod: 'GET',
          endpointUri: '/users/${computed.receiverId}',
        },
        {
          stop: `
            !computed.toEmail
          `,
          endpointMethod: 'POST',
          computed: {
            toName: '_.get(responses, "receiver.displayName", "")',
            toEmail: '_.get(responses, "receiver.email", "")',
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${computed.conversationId}`'
          },
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"contactMessageByOwnerToTaker"',
            data: {
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

    addRoleToUserAtSignup: {
      name: '[Init] User roles at signup',
      description: 'Add roles to user at signup depending if she is a user or a provider',
      event: 'user__created',
      computed: {
        isUser: 'user.roles.some(role => role === "user")',
        isProvider: 'user.roles.some(role => role === "provider")',
        isOrganization: 'user.roles.some(role => role === "organization")',
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: '(!computed.isUser && !computed.isProvider) || computed.isOrganization',
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            roles: `
              user.roles.concat(
                computed.isUser
                  ? (user.roles.includes("applicant") ? [] : ["applicant"])
                  : (user.roles.includes("recruiter") ? [] : ["recruiter"])
              )
            `
          }
        }
      ]
    },

    copyUserNamesIntoPremiumAtCreation: {
      name: '[Init] User names at creation',
      description: 'Copy user names into premium namespace at user creation',
      event: 'user__created',
      computed: {
        isUser: 'user.roles.some(role => role === "user")',
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: '!computed.isUser',
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            metadata: {
              _premium: {
                firstname: 'user.firstname',
                lastname: 'user.lastname'
              }
            }
          }
        }
      ]
    },

    copyUserNamesIntoPremiumAtUpdate: {
      name: '[Sync] User names at update',
      description: 'Copy user names into premium namespace when user is updated',
      event: 'user__updated',
      computed: {
        isUser: 'user.roles.some(role => role === "user")',
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: `
            !computed.isUser ||
            (typeof changesRequested.firstname === "undefined" && typeof changesRequested.lastname === "undefined")
          `,
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            metadata: {
              _premium: {
                firstname: 'user.firstname',
                lastname: 'user.lastname'
              }
            }
          }
        }
      ]
    },

    createOrgForProvider: {
      name: '[Init] Provider organization creation',
      description: 'Create an organization for the provider at signup',
      event: 'user__created',
      run: [
        {
          name: 'organization',
          endpointMethod: 'POST',
          stop: '!user.roles.includes("provider") || user.roles.includes("organization")',
          computed: {
            rolesToUpdate: 'user.roles.includes("recruiter") ? user.roles : user.roles.concat(["recruiter"])',
          },
          endpointUri: '/users',
          endpointPayload: {
            type: '"organization"',
            displayName: 'user.displayName',
            orgOwnerId: 'user.id',
            roles: 'computed.rolesToUpdate',
            email: 'user.email',
            metadata: 'Object.assign({}, user.metadata, { instant: { contactId: user.id } })',
            platformData: 'user.platformData',
          }
        },
        {
          endpointMethod: 'PATCH',
          endpointUri: '/users/${user.id}/organizations/${responses.organization.id}',
          endpointPayload: {
            roles: 'computed.rolesToUpdate'
          }
        }
      ]
    },

    updateChildOrgAtCreation: {
      name: '[Init] Children organizations at creation',
      description: 'Update provider child organization at creation',
      event: 'user__created',
      computed: {
        childOrgId: 'user.id',
        childOrgRoles: 'user.roles',
        parentOrgId: 'Object.keys(user.organizations)[0]',
        isChildOrg: 'Object.keys(user.organizations).length === 1'
      },
      run: [
        {
          name: 'parentOrg',
          description: 'Fetch parent organization',
          stop: `
            !computed.childOrgRoles.includes("provider") ||
            !computed.childOrgRoles.includes("organization") ||
            !computed.isChildOrg
          `,
          endpointMethod: 'GET',
          endpointUri: '/users/${computed.parentOrgId}'
        },
        {
          description: 'Update the child organization with parent organization data',
          computed: {
            parentOrgRoles: '_.get(responses, "parentOrg.roles", [])',
            contactId: '_.get(responses, "parentOrg.metadata.instant.contactId")',
            getParentOrgData: 'key => _.get(responses, `parentOrg.platformData.instant.${key}`)',
            getParentOrgPrivateData: 'key => _.get(responses, `parentOrg.platformData._private.${key}`)',
          },
          endpointMethod: 'PATCH',
          endpointUri: '/users/${computed.childOrgId}',
          endpointPayload: {
            roles: 'computed.parentOrgRoles',
            platformData: {
              instant: {
                emailVerified: 'computed.getParentOrgData("emailVerified")',
                phoneVerified: 'computed.getParentOrgData("phoneVerified")',
                taxIdVerified: 'computed.getParentOrgData("taxIdVerified")',
                accountActive: 'computed.getParentOrgData("accountActive")',
              },
              _private: {
                validTaxIds: 'computed.getParentOrgPrivateData("validTaxIds")',
                premiumEndDate: 'computed.getParentOrgPrivateData("premiumEndDate")'
              }
            }
          }
        },
        {
          description: 'Update user roles within the child organization',
          endpointMethod: 'PATCH',
          endpointUri: '/users/${computed.contactId}/organizations/${computed.childOrgId}',
          endpointPayload: {
            roles: 'computed.parentOrgRoles.filter(role => role !== "organization")'
          }
        }
      ]
    },

    syncChildrenOrgsWithParentOrg: {
      name: '[Sync] Children organizations when parent org updates',
      description: 'Synchronize children orgs with parent org',
      event: 'user__updated',
      computed: {
        parentOrgId: 'user.id',
        mayBeParentOrg: 'Object.keys(user.organizations).length === 0',
        contactId: '_.get(user, "metadata.instant.contactId")',
        premiumEndDate: '_.get(user, "metadata._private.premiumEndDate")',
        changedPremiumEndDate: '_.get(changesRequested, "metadata._private.premiumEndDate")',
      },
      run: [
        // get user to retrieve all children organizations
        {
          name: 'user',
          computed: {
            dataChanged: `
              typeof changesRequested.roles !== "undefined" ||
              typeof computed.changedPremiumEndDate !== "undefined"
            `
          },
          stop: `
            !user.roles.includes("provider") ||
            !user.roles.includes("organization") ||
            !computed.mayBeParentOrg ||
            !computed.contactId ||
            !computed.dataChanged
          `,
          endpointMethod: 'GET',
          endpointUri: '/users/${computed.contactId}'
        },
        // synchronize all children organizations with parent org data
        {
          computed: {
            objects: `
              Object.keys(_.get(responses, "user.organizations", {}))
                .filter(orgId => orgId !== computed.parentOrgId)
                .map(orgId => {
                  return {
                    objectId: orgId,
                    payload: {
                      roles: user.roles,
                      metadata: {
                        _private: {
                          premiumEndDate: computed.premiumEndDate
                        }
                      }
                    }
                  }
                })
            `
          },
          endpointMethod: 'POST',
          endpointUri: '/batch',
          endpointPayload: {
            objectType: '"user"',
            method: '"PATCH"',
            objects: 'computed.objects'
          }
        }
      ]
    },

    // roles "premium" or "newcomer" can be added to an organization at anytime
    // if we don't synchronize user roles within its organization with the organization roles
    // the user will miss the 'premium' role for instance and won't see premium namespace data
    syncUserRolesWithOrg: {
      name: '[Sync] User roles with org',
      description: 'Synchronize user roles with org',
      event: 'user__updated',
      computed: {
        orgId: 'user.id',
        roles: 'user.roles',
        contactId: '_.get(user, "metadata.instant.contactId")',
      },
      run: [
        {
          computed: {
            newRoles: 'computed.roles.filter(role => role !== "organization")'
          },
          stop: `
            !computed.roles.includes("provider") ||
            !computed.roles.includes("organization") ||
            !computed.contactId ||
            typeof changesRequested.roles === "undefined"
          `,
          endpointMethod: 'PATCH',
          endpointUri: '/users/${computed.contactId}/organizations/${computed.orgId}',
          endpointPayload: {
            roles: 'computed.newRoles'
          }
        }
      ]
    },

    activateAccountToUser: {
      name: '[Update] Account activation',
      description: 'Activate user account when requirements are fulfilled',
      event: 'user__updated',
      computed: {
        getPlatformInstantData: 'key => _.get(user, `platformData.instant.${key}`)',
        isUser: 'user.roles.includes("user")',
        isProvider: 'user.roles.includes("provider")'
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: `
            computed.getPlatformInstantData("accountActive") === true ||
            computed.getPlatformInstantData("emailVerified") !== true ||
            computed.getPlatformInstantData("phoneVerified") !== true ||
            (
              !(computed.isUser && user.firstname && user.lastname) &&
              !(computed.isProvider && user.displayName && computed.getPlatformInstantData("taxIdVerified") === true)
            )
          `,
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            platformData: {
              instant: {
                accountActive: true
              }
            }
          }
        }
      ]
    },

    publishAssetsWhenRecruiterActivatesAccount: {
      name: '[Update] Assets activation',
      description: 'Publish assets when recruiter activates her account',
      event: 'user__updated',
      computed: {
        isProvider: 'user.roles.includes("provider")',
        accountActive: '_.get(user, "platformData.instant.accountActive", false)',
        assetsPublished: '_.get(user, "platformData._private.assetsPublished", false)',
      },
      run: [
        {
          name: 'assets',
          description: 'Retrieve the max number of assets allowed (assimilates to "all" assets)',
          endpointMethod: 'GET',
          stop: '!computed.isProvider || computed.accountActive === computed.assetsPublished',
          endpointUri: '/assets?ownerId=${user.id}&nbResultsPerPage=100',
        },
        {
          endpointMethod: 'POST',
          endpointUri: '/batch',
          computed: {
            objects: `
              _.get(responses, "assets.results", []).map(asset => {
                return { objectId: asset.id, payload: { validated: computed.accountActive } }
              })
            `
          },
          endpointPayload: {
            objectType: '"asset"',
            method: '"PATCH"',
            objects: 'computed.objects'
          }
        },
        {
          endpointMethod: 'PATCH',
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            platformData: {
              _private: {
                assetsPublished: 'computed.accountActive'
              }
            }
          }
        }
      ]
    },

    createAssetForApplicant: {
      name: '[Init] Applicant asset at creation',
      description: 'Create an asset that will be associated to the applicant',
      event: 'user__updated',
      computed: {
        startDate: '_.get(user, "metadata.availabilityStartDate", new Date().toISOString())',
        endDate: '_.get(user, "metadata.availabilityEndDate", new Date(new Date().getTime() + 24 * 3600 * 1000).toISOString())',
        assetTypeId: '"assetTypes::applicant"',
        getMetadataInstant: 'key => _.get(user, `metadata.instant.${key}`)',
        getPlatformDataInstant: 'key => _.get(user, `platformData.instant.${key}`)',
      },
      run: [
        {
          name: 'asset',
          endpointMethod: 'POST',
          stop: `
            typeof changesRequested.roles === "undefined" ||
            !user.roles.includes("applicant") ||
            computed.getPlatformDataInstant("assetId") ||
            computed.getPlatformDataInstant("availabilityId")
          `,
          endpointUri: '/assets',
          endpointPayload: {
            name: 'computed.getMetadataInstant("profileTitle") || " "', // empty name not allowed
            description: 'user.description',
            ownerId: 'user.id',
            categoryId: 'computed.getMetadataInstant("categoryId")',
            assetTypeId: 'computed.assetTypeId',
            locations: 'computed.getMetadataInstant("locations") || []',
            price: 'computed.getMetadataInstant("profileSalary")',
            validated: true,
            active: 'computed.getPlatformDataInstant("accountActive") || false',
            metadata: {
              images: 'computed.getMetadataInstant("avatarUrl") ? [{ url: computed.getMetadataInstant("avatarUrl") }] : []',
              // ensuring applicant assets are removed by init-data script
              initDataScript: '_.get(user, "metadata.initDataScript")'
            }
          }
        },
        {
          name: 'availability',
          endpointMethod: 'POST',
          computed: {
            assetId: 'responses.asset.id'
          },
          endpointUri: '/availabilities',
          endpointPayload: {
            assetId: 'computed.assetId',
            startDate: 'computed.startDate',
            endDate: 'computed.endDate',
            quantity: 1
          }
        },
        {
          endpointMethod: 'PATCH',
          endpointUri: '/users/${user.id}',
          endpointPayload: {
            platformData: {
              instant: {
                assetId: 'computed.assetId',
                availabilityId: 'responses.availability.id'
              }
            }
          }
        }
      ]
    },

    updateAssetForApplicant: {
      name: '[Sync] Applicant asset at update',
      description: 'Update applicant asset when applicant user is updated',
      event: 'user__updated',
      computed: {
        getMetadataInstant: 'key => _.get(user, `metadata.instant.${key}`)',
        getPlatformDataInstant: 'key => _.get(user, `platformData.instant.${key}`)'
      },
      run: [
        {
          endpointMethod: 'PATCH',
          stop: `
            !user.roles.includes("applicant") ||
            !computed.getPlatformDataInstant("assetId") ||
            !computed.getPlatformDataInstant("availabilityId")
          `,
          endpointUri: '/assets/${computed.getPlatformDataInstant("assetId")}',
          endpointPayload: {
            name: 'computed.getMetadataInstant("profileTitle") || " "', // empty name not allowed
            description: 'user.description',
            categoryId: 'computed.getMetadataInstant("categoryId")',
            price: 'computed.getMetadataInstant("profileSalary")',
            locations: 'computed.getMetadataInstant("locations") || []',
            validated: true,
            active: 'computed.getPlatformDataInstant("accountActive") || false',
            metadata: {
              images: 'computed.getMetadataInstant("avatarUrl") ? [{ url: computed.getMetadataInstant("avatarUrl") }] : []'
            }
          }
        },
        {
          endpointMethod: 'PATCH',
          endpointUri: '/availabilities/${computed.getPlatformDataInstant("availabilityId")}',
          endpointPayload: {
            startDate: 'computed.startDate',
            endDate: 'computed.endDate',
            quantity: 1
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

    createUnavailabilityForApplicant: {
      name: '[Sync] Applicant unavailabilities',
      description: 'Create unavailability for applicant when she finds a job',
      event: 'transaction__status_changed',
      computed: {
        applicantId: 'transaction.takerId',
        filteredAssetTypeId: '"assetTypes::job"',
      },
      run: [
        {
          name: 'applicant',
          stop: `
            transaction.status !== "validated" ||
            transaction.assetTypeId !== computed.filteredAssetTypeId
          `,
          endpointMethod: 'GET',
          endpointUri: '/users/${computed.applicantId}',
        },
        {
          computed: {
            applicantAssetId: '_.get(responses, "applicant.platformData.instant.assetId")'
          },
          stop: `
            !computed.applicantAssetId
          `,
          endpointMethod: 'POST',
          endpointUri: '/availabilities',
          endpointPayload: {
            assetId: 'computed.applicantAssetId',
            startDate: 'transaction.startDate',
            endDate: 'transaction.endDate',
            quantity: '"-1"'
          }
        }
      ]
    }
  }
  /* eslint-enable no-template-curly-in-string */
}
