// This file is used to seed database with data exported below,
// using init-data.js script.

// Object type keys like 'assetTypes' map to objects to create.
// Corresponding object keys are only used by init-data script to enable references
// like where ids are expected, so that you can use 'assetTypes::someName'
// instead of an id you don’t know (that will look like 'ast_xx…').

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
    coldRack: {
      name: 'Cold rack',
      description: 'Cold rack description',
      assetTypeId: 'assetTypes::renting',
      ownerId: 'users::user1',
      price: 100,
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
        reference: 'X456FB',
        brand: 'Philips',
        dimension: '1m x 1m x 2m',
        transport: false
      },
      metadata: {
        images: [
          { url: 'https://stelace-instant-dev-eu.s3.amazonaws.com/dev/wingon/images/2b183c466e30b2ea7977f3ab1b560009-armoire-de-transfert-froide-1-5-c-monocoque-57682.jpg' }
        ]
      }
    },
    chestFreezer: {
      name: 'Chest freezer',
      description: 'Very large',
      assetTypeId: 'assetTypes::selling',
      ownerId: 'users::user2',
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
        reference: 'coffre-1',
        brand: 'Samsung',
        dimension: '3m x 1.5m x 1.5m',
        transport: true
      },
      metadata: {
        images: [
          { url: 'https://stelace-instant-dev-eu.s3.amazonaws.com/dev/wingon/images/4959e12f23e6b4b296360631a70c12ec-congelateur-coffre-803-litres-525253.jpg' }
        ]
      }
    },
    potatoesCooker: {
      name: 'Potatoes cooker',
      description: 'Very convenient to use',
      assetTypeId: 'assetTypes::renting',
      ownerId: 'users::user3',
      price: 30,
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
          { url: 'https://stelace-instant-dev-eu.s3.amazonaws.com/dev/wingon/images/8ca4e44957fc38547ce3c335156c916d-cuiseur-pommes-de-terre-mat-riau-acier-inoxydable-18-10-qualit-lourde-contenance-25-0-l-32-0-cm-contacto-5666768.jpg' },
        ]
      }
    },
    hoodTypeDishWasher: {
      name: 'Hood type dish washer',
      description: 'Cleans very well',
      assetTypeId: 'assetTypes::renting',
      ownerId: 'users::user3',
      price: 60,
      customAttributes: {
        reference: '7896515',
        brand: 'ElectroLux',
        dimension: null,
        transport: true
      },
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
          { url: 'https://stelace-instant-dev-eu.s3.amazonaws.com/dev/wingon/images/cf63b2383ed277c383715e4c71edb495-Lave vaisselle capot.png' },
        ],
      }
    },
    rotisserie: {
      name: 'Rotisserie',
      description: 'Perfect for any meat',
      assetTypeId: 'assetTypes::selling',
      ownerId: 'users::user3',
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
          { url: 'https://stelace-instant-dev-eu.s3.amazonaws.com/dev/wingon/images/15c7fb9feb258b070dea18e49d241829-rotissoire-autonettoyante-acr-automatique-sur-placard-technique-a-roulette-6056319.jpg' },
        ]
      }
    }
  },
  categories: {
    cold: {
      name: 'Cold'
    },
    pot: {
      name: 'Pots'
    },
    washing: {
      name: 'Washing'
    },
    oven: {
      name: 'Ovens'
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
          logoUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/a5b21e6f26dd2340dd7fc34529972db9-logo-email.png',
          locale: 'fr',
          currency: 'EUR',
          assetTypes: {
            'assetTypes::renting': {
              isDefault: false,
              customAttributes: [
                'reference',
                'brand',
                'dimension',
                'transport'
              ]
            },
            'assetTypes::selling': {
              isDefault: false,
              customAttributes: [
                'reference',
                'brand',
                'dimension',
                'transport'
              ]
            }
          },
          searchOptions: {
            modes: {
              default: {
                assetTypesIds: ['assetTypes::renting', 'assetTypes::selling'],
                customAttributes: [
                  'transport'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              renting: {
                assetTypesIds: ['assetTypes::renting'],
                customAttributes: [
                  'transport'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              selling: {
                assetTypesIds: ['assetTypes::selling'],
                customAttributes: [
                  'transport'
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
    reference: {
      name: 'reference',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.reference_label',
              default: 'Reference' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          priority: 6 // used to order custom attributes in UI
        }
      }
    },
    brand: {
      name: 'brand',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.brand_label',
              default: 'Brand' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          priority: 10 // used to order custom attributes in UI
        }
      }
    },
    dimension: {
      name: 'dimension',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.dimension_label',
              default: 'Dimension' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          priority: 8 // used to order custom attributes in UI
        }
      }
    },
    transport: {
      name: 'transport',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.transport_label',
              default: 'Transport' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          materialIcon: 'directions_car', // example of UIcustomization with metadata
          priority: 10 // used to order custom attributes in UI
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
      displayName: 'Jordan',
      firstname: 'Jordan',
      lastname: 'Rossignol',
      metadata: {
        _private: {
          phone: '+33 9 87 65 43 21',
        },

        instant: {
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/2abc4416b56dfe144e1e2c43d3143bee-Profil-Jordan-003.jpg'
        }
      }
    },
    user2: {
      username: `marketplace-test-user2@example.com`,
      password: `marketplace-test-user2@example.com`,
      email: `marketplace-test-user2@example.com`,
      displayName: 'Sophie',
      firstname: 'Sophie',
      lastname: 'Bleue',
      metadata: {
        _private: {
          phone: '+33 6 87 65 43 21',
        },

        instant: {
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/4060e81d8687239763932b4e59a140d0-132x132_usr_avatar_maman_louve.jpg'
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
        _private: {
          phone: '+33 2 68 65 23 21',
        },

        instant: {
          avatarUrl: 'https://dev-cdn.instant.stelace.com/test/workingoo/images/833a41bdc057376c6954800b12157219-image-principale-919b9d.png'
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
