
// Workflows to be used with Stelace API.
// Below will be imported if `process.env.VUE_APP_MARKETPLACE_TYPE` is ecommerce.

/* eslint-disable quotes */
module.exports = (locale) => ({
  // Object type keys like 'assetTypes' map to objects to create.
  // Nested object keys are only used by init-data script to enable references
  // where ids are expected, so that you can use 'assetTypes::someName'
  // instead of an id you don’t know yet (that will look like 'typ_xx…').
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
    screeneoProjector: {
      name: 'Screeneo home cinema Projector',
      description: `Big screen projection. Ideal for small spaces. Compatible with 3D movies
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::projector',
      ownerId: 'users::user1',
      quantity: 10,
      price: 700,
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
        brand: 'Screeneo',
        reference: 'HDP1590'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/aeb5938ab143b416ce82f247c7f53fde-screeneoProjector1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/af971259f4c6675e798bb3e71723c0d2-screeneoProjector2.jpg' },
        ]
      }
    },
    benQProjector: {
      name: 'BenQ W1080ST+ Full HD Video Projector',
      description: `Very bright images. Easy installation with an adjustable feet. Full HD

        - Weight: 2.85kg
        - Resolution: Full HD 1080p
        - 3D compatible projection
        - Optical zoom: x1.2
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::projector',
      ownerId: 'users::user2',
      quantity: 10,
      price: 590,
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
        brand: 'BenQ',
        reference: 'W1080ST'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/7e61da7a1495451891d80f35ca5a0eff-benQProjector1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/768fd316c70fd1cd02ba9c0eaad93783-benQProjector2.png' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/844349034d58d4b8ce17ea8317b6e49b-benQProjector3.jpg' }
        ]
      }
    },
    sonyCamcorder: {
      name: 'Sony FDR-AX53 4K Camcorder',
      description: `High-quality image in 4K format with the Balanced Optical SteadyShot image stabilizer

        - Lens type: ZEISS Vario-Sonnar® T*
        - Extended zoom: 4K: 30x ; HD: 40x
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::camera',
      ownerId: 'users::user1',
      quantity: 10,
      price: 600,
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
        brand: 'Sony',
        reference: 'FDR-AX53'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/7fc430ef717a056edcc5a599352acbf5-sonyCamcorder1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/921d8306c22b0b68fa567fcbbd2efd00-sonyCamcorder2.jpg' },
        ]
      }
    },
    wacomTablet: {
      name: 'Wacom Graphics Drawing Pro Tablet 12"',
      description: `Optimized for hours of image editing, illustration or design work

        - Weight: 990g
        - Tilt recognition: 60 levels
        - Pressure sensitivity: 2048 levels
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::design',
      ownerId: 'users::user2',
      quantity: 10,
      price: 1000,
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
        brand: 'Sony',
        reference: 'PTH451'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/647b56ca71b8e91974a71abb41d5d034-wacomTablet1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/23713919ba37ef63a6f2daf225748c22-wacomTablet2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/8f01d1330b08db2eea58e863e27d53f1-wacomTablet3.jpg' }
        ]
      }
    },
    ps4VR: {
      name: 'Playstation 4 VR + video games bundle',
      description: `Bundle includes PlayStation VR headset, PlayStation camera, PlayStation VR Move controllers

        Included video games:
        - DRIVECLUB VR
        - PlayStation VR Worlds
        - RIGS Mechanized Combat League
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::videogame',
      ownerId: 'users::user2',
      quantity: 10,
      price: 1200,
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
        brand: 'Sony'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/9dc867ce366a9532d4c0a004dca745a7-ps4VR1.png' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/450b833bfa5e067040a7e914d3e37999-ps4VR2.png' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/59a271976c82b4fd42bc3ff0c65b3345-ps4VR3.jpg' }
        ]
      }
    },
    sonySportCamera: {
      name: 'Sony Action Cam',
      description: `Ideal for outside recording. 4K image quality

        - Weight: 200g
        - Video resolution: Ultra HD 4K 3840 x 2160 25/30p, Full HD 1920x1080 25/30p, 30/60p, 100/120p
        - Sony steadyshot stabilizer
      `,
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::camera',
      ownerId: 'users::user1',
      quantity: 10,
      price: 30,
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
        brand: 'Sony',
        reference: 'FDR-X1000VR'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/c18f010010e0f00dade000be74af4cb4-sonySportCamera1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/c5cc324598fd1f655aa2638c35c7608e-sonySportCamera2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/3dd011f78fceba3fa62edcb35434ad6b-sonySportCamera3.jpg' }
        ]
      }
    },
    ricohCamera: {
      name: 'Ricoh Theta camera 360 degrees',
      description: `Transfer videos directly to your mobile device without the need of a computer
        Full HD Video at 30fps , 360 Degree Spherical Video Supported by YouTube
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::camera',
      ownerId: 'users::user2',
      quantity: 10,
      price: 150,
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
        brand: 'Ricoh Theta'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/d946b45029f8fe053d9c3082bcc69995-ricohCamera1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/f38e8ac041f10b4c28f44b57dc1f4eb4-ricohCamera2.jpg' },
        ]
      }
    },
    focusriteSoundCard: {
      name: 'Focusrite Scarlett Solo sound card',
      description: `High-performance converters enable you to record and mix at up to 24-bit/ 192kHz.

        - Resolution: 24-bit/192kHz
        - Protocol: USB 2.0
        - Connectivity: USB Type-C
      `,
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::sound',
      ownerId: 'users::user2',
      quantity: 10,
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
        brand: 'Focusrite'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/d96dd6b2ef8fd43b50292892f44f6ca5-focusriteSoundCard1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/062ae2cf6270736183865e8c20bda947-focusriteSoundCard2.jpg' },
        ]
      }
    },
    goproHero3: {
      name: 'GoPro HERO 3: White Edition',
      description: `Professional quality video capture in 1080p 30fps, 960p 30 fpts, 720p 60 fps, and WVGA 60 fps

        - Wi-Fi compatible with the GoPro app for Smartphones/Tablets
        - 197’/ 60m Waterproof Housing with integrated flat lense housing
      `,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::camera',
      ownerId: 'users::user1',
      price: 500,
      quantity: 10,
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
        brand: 'GoPro'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/f0bf44b22ea66a3ba2ad7b8372a0b3aa-goproHero3.png' },
        ]
      }
    },
    canon600D: {
      name: 'Canon EOS 600D',
      description: `Renting this camera with accessories:
        - Transport bag
        - 2 objectives included
        - Memory card
        - Battery charger
      `,
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::camera',
      ownerId: 'users::user1',
      price: 60,
      quantity: 10,
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
        brand: 'Canon',
        reference: 'EOS 600D'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/366ceb88595c57cf9fba86373b2fc434-canon600D1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/c00144a4ee6bfc17055b60c1e83f0a4b-canon600D2.jpg' },
          { name: 'image3', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/173ed1d199389261b0f9d8932b8d66ae-canon600D3.jpg' }
        ]
      }
    },
    nintendoSwitch: {
      name: 'Nintendo Switch + video games bundle',
      description: `Play interactive games with friends or family

        List of included games:
        - Zelda, Mario Kart 8 Deluxe
        - Mario Kart 8 Deluxe
        - New Super Mario Bros U Deluxe
      `,
      assetTypeId: 'assetTypes::renting',
      categoryId: 'categories::videogame',
      ownerId: 'users::user1',
      price: 30,
      quantity: 10,
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
        brand: 'Nintendo'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/a956264c9cd67c7b0a6099445950451e-nintendoSwitch1.jpg' },
          { name: 'image2', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/bd9c8700e9545bbd3cbe23f87b32f560-nintendoSwitch2.jpg' },
        ]
      }
    },
    ps3: {
      name: 'Playstation 3',
      description: `Play your favorite franchises: LittleBigPlanet, God of War, Gran Turismo, Uncharted...`,
      assetTypeId: 'assetTypes::selling',
      categoryId: 'categories::videogame',
      ownerId: 'users::user2',
      price: 400,
      quantity: 10,
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
        brand: 'Sony'
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://stelace-instant-files.s3.amazonaws.com/p/238393/test/images/d1ee5a9da13c068cc6384ea8b7eaaa0f-ps3.jpg' },
        ]
      }
    }
  },
  categories: {
    projector: {
      name: 'Projector'
    },
    camera: {
      name: 'Camera'
    },
    design: {
      name: 'Design'
    },
    videogame: {
      name: 'Video game'
    },
    sound: {
      name: 'Sound'
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
          locale,
          currency: 'EUR',
          assetTypes: {
            'assetTypes::renting': {
              customAttributes: [
                'brand',
                'reference',
              ]
            },
            'assetTypes::selling': {
              customAttributes: [
                'brand',
                'reference',
              ]
            }
          },
          searchOptions: {
            modes: {
              default: {
                assetTypesIds: ['assetTypes::renting', 'assetTypes::selling'],
                customAttributes: [
                  'brand',
                  'reference'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              renting: {
                assetTypesIds: ['assetTypes::renting'],
                customAttributes: [
                  'brand'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              selling: {
                assetTypesIds: ['assetTypes::selling'],
                customAttributes: [
                  'brand',
                  'reference'
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
              main: {
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
    new: {
      name: 'reference',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.reference_label',
              default: 'New' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
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
  /* eslint-enable quotes */
})
