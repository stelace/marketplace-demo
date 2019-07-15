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
