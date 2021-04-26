// This file is used to seed Stelace database with data exported below,
// using init-data.js script (`yarn seed`).

const { getWorkflows } = require('../workflows')

// Please ensure you add your own translations if not using 'en' or 'fr'
const locale = process.env.VUE_APP_DEFAULT_LANGUAGE || 'en'

/* eslint-disable quotes */
module.exports = {
  // Object type keys like 'assetTypes' map to objects to create.
  // Nested object keys are only used by init-data script to enable references
  // where ids are expected, so that you can use 'assetTypes::someName'
  // instead of an id you don’t know yet (that will look like 'typ_xx…').
  assetTypes: {
    dish: {
      name: 'Meals',
      timeBased: false,
      infiniteStock: false,
      timing: {
        timeUnit: 'm',
        minDuration: { m: 15 }
      },
      active: true,
      pricing: {
        // ownerFeesPercent: 5,
        takerFeesPercent: 6
      }
    },
    // selling: {
    //   name: 'Selling',
    //   timeBased: false,
    //   infiniteStock: false,
    //   active: true
    // }
  },
  assets: {
    veganChili: {
      name: 'Vegan Chili',
      description: `Homemade Vegan Chili.
        Made with beans and veggies.
        Portions are 1qt.
        Available after 3pm, please get in touch.
      `,
      assetTypeId: 'assetTypes::dish',
      categoryId: 'categories::orderAhead',
      ownerId: 'users::user1',
      price: 12.50,
      locations: [
        {
          latitude: 40.7144534,
          longitude: -73.9757009,
          shortDisplayName: 'Long Island City'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        vegan: true,
        cuisine: ['Slovak'],
        delivery: ['Buyer picks up']
      },
      metadata: {
        images: [
          { name: 'aix-1', url: 'https://hips.hearstapps.com/delish/assets/18/11/1520973187-vegetarian-chili-horizontal.jpg' },
          { name: 'aix-2', url: 'https://www.thespruceeats.com/thmb/HGlCtNKw_rph_NHvhE_IuqOH5FI=/1500x844/smart/filters:no_upscale()/vegetarian-and-vegan-chili-recipe-3377016-7-7copy_preview-5b105e31fa6bcc0036b33edd.jpeg' },
          { name: 'aix-3', url: 'https://itdoesnttastelikechicken.com/wp-content/uploads/2017/01/The-Best-Vegan-Chili-Ever-recipe-vegetarian-tofu-beans-easy-06.jpg' }
        ]
      }
    },
    bananaMuffin: {
      name: 'Banana Muffin',
      description: 'Freshly baked banana muffins. Warm and delicious!',
      assetTypeId: 'assetTypes::dish',
      categoryId: 'categories::orderAhead',
      ownerId: 'users::user2',
      price: 5,
      locations: [
        {
          latitude: 40.6711553,
          longitude: -74.0316808,
          shortDisplayName: 'Brooklyn'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        glutenFree: true,
        cuisine: ['French'],
        delivery: ['Buyer picks up']
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://images-gmi-pmc.edge-generalmills.com/3eda2916-bd40-4c87-a15b-0c3016c61d98.jpg' },
          { name: 'image', url: 'https://www.joyofbaking.com/images/facebook/bananamuffins.jpg' },
          { name: 'image', url: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2015/5/26/0/FNK_banana-muffins-recipe_s4x3.jpg.rend.hgtvcom.616.462.suffix/1432745411041.jpeg' }
        ]
      }
    },
    cauliflowerPizza: {
      name: 'Cauliflower Pizza',
      description: 'Cauliflower pizza with toppings of your choice. Available 24 hours after ordering.',
      assetTypeId: 'assetTypes::dish',
      categoryId: 'categories::orderAhead',
      ownerId: 'users::user1',
      price: 50,
      locations: [
        {
          latitude: 40.7287193,
          longitude: -74.0118588,
          shortDisplayName: 'Manhattan'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        glutenFree: true,
        cuisine: ['American'],
        delivery: ['Buyer picks up']
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2016/8/10/1/WU1405H_Cauliflower-Crust-Pizza_s4x3.jpg.rend.hgtvcom.826.620.suffix/1580139101557.jpeg' },
          { name: 'image2', url: 'https://realhousemoms.com/wp-content/uploads/Cauliflower-Pizza-Crust-Easy-Dinner-Recipe-HERO.jpg' }
        ]
      }
    },
    hotChickenSandwich: {
      name: 'Hot Chicken Sandwich',
      description: 'Nashville hot chicken sandwiches! Battered and fried, served with pickles and coleslaw. Can be ready in 1 hour.',
      assetTypeId: 'assetTypes::dish',
      categoryId: 'categories::orderAhead',
      ownerId: 'users::user2',
      price: 14,
      locations: [
        {
          latitude: 40.7339468,
          longitude: -73.996405,
          shortDisplayName: 'Manhattan'
        }
      ],
      validated: true,
      active: true,
      customAttributes: {
        cuisine: ['American'],
        delivery: ['Buyer picks up']
      },
      metadata: {
        images: [
          { name: 'image1', url: 'https://1.bp.blogspot.com/-7jpHUMkxi-E/XvUZs9gVGQI/AAAAAAACJcc/pmK_msV1-pQ3WcCqls6chJtYS_F2NzGHgCK4BGAsYHg/s5436/DSC06509.jpg' },
          { name: 'image2', url: 'https://foodchannel.com/wp-content/uploads/sites/78/2017/07/nashville-hot.jpg?w=1000&h=600&crop=1' },
          { name: 'image3', url: 'https://justsodelightful.files.wordpress.com/2020/02/hot-chicken-sandwich.jpg?w=1024' }
        ]
      }
    }
  },
  categories: {
    orderAhead: {
      name: "Pre-order"
    },
    // delivery: {
    //   name: 'Delivery'
    // },
    // pickup: {
    //   name: 'Pickup'
    // }
  },
  config: {
    default: {
      stelace: {
        instant: {
          serviceName: process.env.VUE_APP_SERVICE_NAME,
          // The following is kept in sync with STELACE_INSTANT_WEBSITE_URL when deploying translations
          // And needed to enable dashboard live content editor
          // platformUrl: 'https://example.com,
          logoUrl: 'https://d328vk3fbp0jh4.cloudfront.net/prod/SYR-letters.png',
          locale,
          currency: 'USD',
          assetTypes: {
            'assetTypes::dish': {
              customAttributes: [
                'vegan',
                'glutenFree',
                'delivery',
                'cuisine'
              ]
            },
          },
          searchOptions: {
            modes: {
              default: {
                assetTypesIds: ['assetTypes::dish'],
                customAttributes: [
                  'vegan',
                  'glutenFree',
                  'delivery',
                  'cuisine'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              // pickup: {
              //   assetTypesIds: ['assetTypes::dish'],
              //   customAttributes: [
              //     'pickup'
              //   ],
              //   isActiveFor: [
              //     'public',
              //     'user'
              //   ]
              // },
              // delivery: {
              //   // I think this creates a search that will return
              //   // a subset of things based on assetType and attributes
              //   assetTypesIds: ['assetTypes::dish'],
              //   customAttributes: [
              //     'delivery'
              //   ],
              //   isActiveFor: [
              //     'public',
              //     'user'
              //   ]
              // }
              glutenFree: {
                assetTypesIds: ['assetTypes::dish'],
                customAttributes: [
                  'glutenFree'
                ],
                isActiveFor: [
                  'public',
                  'user'
                ]
              },
              vegan: {
                // I think this creates a search that will return
                // a subset of things based on assetType and attributes
                assetTypesIds: ['assetTypes::dish'],
                customAttributes: [
                  'vegan'
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

          assetsInUniqueCountry: 'us',
          assetsInUniqueCountryActive: false,
          googleAnalyticsTrackingActive: false,
          googleAnalyticsTrackingId: '', // 'UA-186732740-1', // for development

          twitterUsername: '',
          // facebookUrl: ''
        }
      }
    }
  },
  customAttributes: {
    // pickup: {
    //   name: 'pickup',
    //   type: 'boolean',
    //   metadata: {
    //     instant: {
    //       i18n: {
    //         label: {
    //           entry: 'instant',
    //           field: 'config.customAttributes.pickup_label',
    //           default: 'Pick-up' // in case translation is missing
    //           // Generally in the default language of the platform
    //         },
    //         description: {}
    //       },
    //       materialIcon: 'directions_walk', // example of UI customization with metadata
    //       priority: 10 // used to order custom attributes in UI
    //     }
    //   }
    // },
    // delivery: {
    //   name: 'delivery',
    //   type: 'boolean',
    //   metadata: {
    //     instant: {
    //       i18n: {
    //         label: {
    //           entry: 'instant',
    //           field: 'config.customAttributes.delivery_label',
    //           default: 'Delivery'
    //         },
    //         description: {}
    //       },
    //       materialIcon: 'delivery_dining', // example of UI customization with metadata
    //       priority: 11 // used to order custom attributes in UI
    //     }
    //   }
    // },
    vegan: {
      name: 'vegan',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.vegan_label',
              default: 'Vegan' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          materialIcon: 'grass', // example of UI customization with metadata
          priority: 40 // used to order custom attributes in UI
        }
      }
    },
    glutenFree: {
      name: 'glutenFree',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.glutenFree_label',
              default: 'Gluten Free'
            },
            description: {}
          },
          materialIcon: 'no_food', // example of UI customization with metadata
          priority: 41 // used to order custom attributes in UI
        }
      }
    },
    cuisine: {
      name: 'cuisine',
      type: 'tags',
      listValues: [
        'Ainu',
        'Albanian',
        'Argentine',
        'Andhra',
        'American',
        'Anglo-Indian',
        'Arab',
        'Armenian',
        'African',
        'Assyrian',
        'Awadhi',
        'Azerbaijani',
        'Balochi',
        'Bashkir',
        'Belarusian',
        'Bangladeshi',
        'Bengali',
        'Berber',
        'Brazilian',
        'British',
        'Burmese',
        'Bulgarian',
        'Cajun',
        'Cantonese',
        'Caribbean',
        'Chechen',
        'Chinese cuisine',
        'Chinese Islamic',
        'Circassian',
        'Crimean Tatar',
        'Cypriot',
        'Czech',
        'Danish',
        'Egyptian',
        'English',
        'Ethiopian',
        'Eritrean',
        'Estonian',
        'French',
        'Filipino',
        'Georgian',
        'German',
        'Goan',
        'Goan Catholic',
        'Greek',
        'Gujarati',
        'Hyderabad',
        'Indian cuisine',
        'Indian Chinese',
        'Indian Singaporean cuisine',
        'Indonesian',
        'Inuit',
        'Irish',
        'Italian-American',
        'Italian cuisine',
        'Jamaican',
        'Japanese',
        'Jewish - Israeli',
        'Karnataka',
        'Kazakh',
        'Keralite',
        'Korean',
        'Kurdish',
        'Laotian',
        'Lebanese',
        'Latvian',
        'Lithuanian',
        'Louisiana Creole',
        'Maharashtrian',
        'Mangalorean',
        'Malay',
        'Malaysian Chinese cuisine',
        'Malaysian Indian cuisine',
        'Mediterranean cuisine',
        'Mennonite',
        'Mexican',
        'Mordovian',
        'Mughal',
        'Native American',
        'Nepalese',
        'New Mexican',
        'Nigerian',
        'Odia',
        'Parsi',
        'Pashtun',
        'Polish',
        'Pennsylvania Dutch',
        'Pakistani',
        'Peranakan',
        'Persian',
        'Peruvian',
        'Portuguese',
        'Punjabi',
        'Québécois',
        'Rajasthani',
        'Romani',
        'Romanian',
        'Russian',
        'Sami',
        'Serbian',
        'Sindhi',
        'Slovak',
        'Slovenian',
        'Somali',
        'South Indian',
        'Soviet',
        'Spanish',
        'Sri Lankan',
        'Singaporean',
        'South African',
        'Taiwanese',
        'Tatar',
        'Texan',
        'Thai',
        'Turkish',
        'Tamil',
        'Udupi',
        'Ukrainian',
        'Vietnamese',
        'West African',
        'Yamal',
        'Zambian',
        'Zanzibari',
      ],
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.cuisine_label',
              default: 'Cuisine'
            },
            description: {}
          },
          materialIcon: 'ramen_dining', // example of UI customization with metadata
          priority: 39 // used to order custom attributes in UI
        }
      }
    },
    delivery: {
      name: 'delivery',
      type: 'tags',
      listValues: [
        'Buyer picks up',
        'Seller delivers',
        'Seller ships'
      ],
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.delivery_label',
              default: 'Delivery Options'
            },
            description: {}
          },
          materialIcon: 'delivery_dining', // example of UI customization with metadata
          priority: 38 // used to order custom attributes in UI
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
  workflows: getWorkflows(locale)
  /* eslint-enable quotes */
}
