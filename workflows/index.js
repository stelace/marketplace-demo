
// Workflows to be used with Stelace API.
// Please refer to the Docs for more info: https://stelace.com/docs/command/workflows

// '`${computed.var}`' template strings can be used in plain strings in Workflows,
// and will be evaluated during run.
// Please note that backticks ` are not needed in endpointUri nor in endpointHeaders,
// where only strings are expected and parsed as template strings anyway.

// You can also use Workflow context for easier maintenance
// with environment variables as in `${env.SOME_VAR}`, SOME_VAR being set via Config API

/* eslint-disable no-template-curly-in-string */
module.exports = {
  getWorkflows: (locale = 'en') => ({
    getEmailCheckTokenAtRegistration: {
      name: '[Check] Email check token at user registration',
      description: 'Create a token used to validate the email address of a new user',
      event: 'user__created',
      context: ['stelace'],
      computed: {
        expirationDate: 'new Date(new Date().getTime() + 24 * 3600 * 1000).toISOString()'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!user.email',
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
      description: 'Create a token to validate a new email address filled by user',
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
    sendEmailCheckToken: {
      name: '[Email] Email validation link',
      description: `
      Send an email with a link to validate the user email address.
      Used at user registration or when the user updates her email.
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
            // 'name' property is a field of 'email' entry to use as email content
            name: 'computed.isRegistration ? "registration" : "emailCheck"',
            data: {
              emailCheckLink: 'computed.emailCheckLink'
            },
            // You could also set locale dynamically with a computed property,
            // for instance relying on some user metadata set by your app
            locale: `"${locale}"`,
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
      description: 'Send an email with password reset link requested by user',
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
            locale: `"${locale}"`,
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
      context: ['stelace'],
      computed: {
        // fallback to empty strings for email content
        transactionId: 'transaction.id',
        ownerName: 'owner.displayName || ""',
        takerName: 'taker.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'taker.displayName || ""',
        toEmail: 'taker.email'
      },
      run: [
        {
          name: 'messages',
          endpointMethod: 'GET',
          endpointUri: '/messages?topicId=${computed.transactionId}',
        },
        {
          name: 'acceptedByOwnerEmail',
          endpointMethod: 'POST',
          computed: {
            isEmptyConversation: '!responses.messages.results.filter(message => !message.metadata.isHiddenMessage).length',
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${responses.messages.results[0].conversationId}`'
          },
          stop: '!computed.toEmail || computed.isEmptyConversation',
          skip: 'transaction.status !== "accepted"',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionAcceptedByOwnerToTaker"',
            data: {
              assetName: 'computed.assetName',
              ownerName: 'computed.ownerName',
              takerName: 'computed.takerName',
              conversationLink: 'computed.conversationLink'
            },
            locale: `"${locale}"`,
            to: {
              address: 'computed.toEmail',
              name: 'computed.toName'
            }
          }
        },
        {
          name: 'refusedByOwnerEmail',
          endpointMethod: 'POST',
          computed: {
            isEmptyConversation: '!responses.messages.results.filter(message => !message.metadata.isHiddenMessage).length',
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${responses.messages.results[0].conversationId}`'
          },
          stop: '!computed.toEmail || computed.isEmptyConversation',
          skip: `
            transaction.status !== "cancelled" ||
            transaction.cancellationReason !== "refusedByOwner"
          `,
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionRefusedByOwnerToTaker"',
            data: {
              ownerName: 'computed.ownerName',
              assetName: 'computed.assetName',
              takerName: 'computed.takerName',
              conversationLink: 'computed.conversationLink'
            },
            locale: `"${locale}"`,
            to: {
              address: 'computed.toEmail',
              name: 'computed.toName'
            }
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
        takerName: 'taker.displayName || ""',
        ownerName: 'owner.displayName || ""',
        assetName: '_.get(transaction, "assetSnapshot.name", "")',
        toName: 'owner.displayName || ""',
        toEmail: 'owner.email'
      },
      run: [
        {
          name: 'messages',
          endpointMethod: 'GET',
          endpointUri: '/messages?topicId=${computed.transactionId}',
        },
        // accepted
        {
          name: 'acceptedByTakerEmail',
          endpointMethod: 'POST',
          computed: {
            isEmptyConversation: '!responses.messages.results.filter(message => !message.metadata.isHiddenMessage).length',
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${responses.messages.results[0].conversationId}`'
          },
          stop: '!computed.toEmail || computed.isEmptyConversation',
          skip: 'transaction.status !== "validated"',
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionAcceptedByTakerToOwner"',
            data: {
              takerName: 'computed.takerName',
              assetName: 'computed.assetName',
              ownerName: 'computed.ownerName',
              conversationLink: 'computed.conversationLink'
            },
            locale: `"${locale}"`,
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
          stop: '!computed.toEmail || computed.isEmptyConversation',
          endpointMethod: 'POST',
          computed: {
            isEmptyConversation: '!responses.messages.results.filter(message => !message.metadata.isHiddenMessage).length',
            conversationLink: '`${env.STELACE_INSTANT_WEBSITE_URL}/i/${responses.messages.results[0].conversationId}`'
          },
          endpointUri: '/emails/send-template',
          endpointPayload: {
            name: '"transactionRefusedByTakerToOwner"',
            data: {
              takerName: 'computed.takerName',
              assetName: 'computed.assetName',
              conversationLink: 'computed.conversationLink',
              ownerName: 'computed.ownerName'
            },
            locale: `"${locale}"`,
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
        messageId: '_.get(message, "id")',
        receiverId: '_.get(message, "receiverId")',
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
          stop: 'transaction.status !== "validated"',
          endpointUri: '/transactions/${transaction.id}/transitions',
          endpointPayload: {
            name: '"complete"'
          }
        }
      ]
    },

    captureStripePaymentIntent: {
      name: 'Capture Stripe payment intent',
      description: `
        When the owner accepts the transaction, capture the payment intent so the money is effectively taken from the taker
      `,
      event: 'transaction__status_changed',
      computed: {
        stripePaymentIntentId: '_.get(transaction, "platformData.stripePaymentIntentId")',
        currencyDecimal: '_.get(transaction, "platformData.currencyDecimal", 2)'
      },
      run: [
        {
          endpointMethod: 'POST',
          stop: '!computed.stripePaymentIntentId || transaction.status !== "validated"',
          endpointUri: '/integrations/stripe/request',
          endpointPayload: {
            method: '"paymentIntents.capture"',
            args: ['computed.stripePaymentIntentId', {
              amount_to_capture: 'transaction.takerAmount * Math.pow(10, computed.currencyDecimal)',
              application_fee_amount: 'transaction.platformAmount * Math.pow(10, computed.currencyDecimal) || undefined'
            }]
          }
        }
      ]
    },

    onStripePaymentIntentCancellation: {
      name: 'On Stripe payment intent cancellation',
      description: `
        When a payment intent is cancelled because the uncapture duration max limit is exceeded,
        the associated transaction must be cancelled too.
        Otherwise the transaction owner can still accept it.
      `,
      event: 'stripe_payment_intent.canceled',
      computed: {
        paymentIntentId: '_.get(metadata, "data.object.id")',
        transactionId: '_.get(metadata, "data.object.metadata.transactionId")'
      },
      run: [
        {
          stop: '!computed.paymentIntentId || !computed.transactionId',
          endpointMethod: 'POST',
          endpointUri: '/transactions/${computed.transactionId}/transitions',
          endpointPayload: {
            name: '"cancel"',
            data: {
              cancellationReason: '"forceCancel"'
            }
          }
        }
      ]
    },

    onStripeCheckoutCompletion: {
      name: 'On Stripe completed checkout session',
      description: `
        This event is created after a completed checkout session (notification via Stripe webhook).
        The objective of this workflow is to retrieve the linked transaction to the session payment intent via metadata
        and trigger the transition 'confirmAndPay' as taker has paid.
      `,
      event: 'stripe_checkout.session.completed',
      context: ['stelace'],
      computed: {
        paymentIntentId: '_.get(metadata, "data.object.payment_intent")',
      },
      run: [
        {
          stop: '!computed.paymentIntentId',
          name: 'paymentIntent',
          endpointMethod: 'POST',
          endpointUri: '/integrations/stripe/request',
          endpointPayload: {
            method: '"paymentIntents.retrieve"',
            args: 'computed.paymentIntentId'
          }
        },
        {
          stop: '!computed.transactionId',
          computed: {
            transactionId: '_.get(responses.paymentIntent, "metadata.transactionId")'
          },
          name: 'transaction',
          endpointMethod: 'GET',
          endpointUri: '/transactions/${computed.transactionId}'
        },
        {
          computed: {
            transaction: 'responses.transaction'
          },
          endpointMethod: 'POST',
          endpointUri: '/messages',
          endpointPayload: {
            content: '" "',
            topicId: 'computed.transactionId',
            senderId: 'computed.transaction.takerId',
            receiverId: 'computed.transaction.ownerId'
          }
        },
        {
          endpointMethod: 'POST',
          endpointUri: '/transactions/${computed.transactionId}/transitions',
          endpointPayload: {
            name: '"confirmAndPay"'
          }
        }
      ],
    }
  })
}
/* eslint-enable no-template-curly-in-string */
