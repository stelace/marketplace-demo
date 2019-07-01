// messages should be sorted from the most recently created to the old ones
export function getTopicId (messages) {
  return messages.reduce((memo, message) => {
    if (memo) return memo

    if (message.topicId) {
      return message.topicId
    }

    return memo
  }, null)
}
